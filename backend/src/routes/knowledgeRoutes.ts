import { Router } from "express";
import { prisma } from "../server";
import { mcpLogger } from "../utils/logger";
import { KnowledgeAgent } from "../services/agents/knowledgeAgent";

const router = Router();
const knowledgeAgent = new KnowledgeAgent();

async function getProjectData(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      blueprint: true,
      projectMemoryState: true,
    }
  });

  const researchResult = await prisma.researchResult.findFirst({
    where: { workflowId },
    orderBy: { createdAt: "desc" }
  });

  const parseResult = (result: any) => {
    if (!result?.content) return null;
    try { return JSON.parse(result.content); } catch { return result.content; }
  };

  return {
    title: workflow?.title,
    idea: workflow?.idea,
    status: workflow?.status,
    blueprint: workflow?.blueprint,
    projectState: workflow?.projectMemoryState?.[0],
    research: parseResult(researchResult)
  };
}

router.get("/:workflowId/graph", async (req: any, res: any): Promise<void> => {
  try {
    const { workflowId } = req.params;
    const projectData = await getProjectData(workflowId);
    
    // Check if we have cached graph data in projectMemoryState or if we need to generate it
    // For now, generate it dynamically to ensure it's always up to date
    const graphData = await knowledgeAgent.generateGraphData(workflowId, projectData);
    
    res.json({ success: true, graph: graphData });
  } catch (error: any) {
    mcpLogger.error("KnowledgeRoute", "Failed to get graph data", error);
    res.status(500).json({ error: "Failed to get graph data" });
  }
});

router.get("/:workflowId/iq", async (req: any, res: any): Promise<void> => {
  try {
    const { workflowId } = req.params;
    const projectData = await getProjectData(workflowId);
    const iqData = await knowledgeAgent.getDashboardStats(projectData);
    res.json({ success: true, iq: iqData });
  } catch (error: any) {
    mcpLogger.error("KnowledgeRoute", "Failed to get IQ stats", error);
    res.status(500).json({ error: "Failed to get IQ stats" });
  }
});

router.post("/:workflowId/insight", async (req: any, res: any): Promise<void> => {
  try {
    const { workflowId } = req.params;
    const { nodeName } = req.body;
    const projectData = await getProjectData(workflowId);
    const insight = await knowledgeAgent.generateNodeInsight(nodeName, workflowId, projectData);
    res.json({ success: true, insight });
  } catch (error: any) {
    mcpLogger.error("KnowledgeRoute", "Failed to get node insight", error);
    res.status(500).json({ error: "Failed to get node insight" });
  }
});

router.post("/:workflowId/predict", async (req: any, res: any): Promise<void> => {
  try {
    const { workflowId } = req.params;
    const { changeDescription } = req.body;
    const projectData = await getProjectData(workflowId);
    const prediction = await knowledgeAgent.predictImpact(changeDescription, projectData);
    res.json({ success: true, prediction });
  } catch (error: any) {
    mcpLogger.error("KnowledgeRoute", "Failed to predict impact", error);
    res.status(500).json({ error: "Failed to predict impact" });
  }
});

router.post("/:workflowId/search", async (req: any, res: any): Promise<void> => {
  try {
    const { workflowId } = req.params;
    const { query } = req.body;
    const projectData = await getProjectData(workflowId);
    const searchResult = await knowledgeAgent.searchKnowledge(query, projectData);
    res.json({ success: true, answer: searchResult.answer });
  } catch (error: any) {
    mcpLogger.error("KnowledgeRoute", "Failed to search knowledge", error);
    res.status(500).json({ error: "Failed to search knowledge" });
  }
});

export default router;
