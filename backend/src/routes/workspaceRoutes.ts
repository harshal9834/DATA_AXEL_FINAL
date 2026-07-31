import { Router } from "express";
import { verifyFirebaseToken, AuthRequest } from "../middleware/verifyFirebaseToken";
import { prisma } from "../server";
import { mcpLogger } from "../utils/logger";

const router = Router();

// Get full workspace state
router.get("/:workflowId", verifyFirebaseToken, async (req: AuthRequest, res: any): Promise<void> => {
  try {
    const { workflowId } = req.params as { workflowId: string };
    const userId = req.user.id;

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        agents: true,
        projectBlueprint: true,
        memoryNodes: true,
        projectMemory: true,
      }
    });
    if (!workflow) { res.status(404).json({ error: "Workflow not found" }); return; }

    if (workflow.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    // Fetch results separately to avoid Prisma include issues
    const [researchResults, innovationResults, architectureResults, backendResults, frontendResults, docsResults, analysisResults] = await Promise.all([
      prisma.researchResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
      prisma.innovationResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
      prisma.architectureResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
      prisma.backendResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
      prisma.frontendResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
      prisma.documentationResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
      prisma.analysisResult.findMany({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
    ]);

    const parseResult = (result: any) => {
      if (!result?.content) return null;
      if (result.content.startsWith("__TYPE:")) return null; // skip extended docs
      try { return JSON.parse(result.content); } catch { return result.content; }
    };

    // Parse extended documents from analysisResults
    const extendedDocs: Record<string, any> = {};
    for (const r of analysisResults) {
      const match = r.content.match(/^__TYPE:([^_]+)__(.*)$/s);
      if (match) {
        const [, docType, docContent] = match;
        if (docType && docContent && !extendedDocs[docType]) {
          try { extendedDocs[docType] = JSON.parse(docContent as string); } catch { extendedDocs[docType] = docContent; }
        }
      }
    }

    const workspace = {
      workflowId: workflow.id, title: workflow.title, idea: workflow.idea,
      status: workflow.status, overallProgress: workflow.overallProgress,
      currentAgent: workflow.currentAgent, agents: workflow.agents,
      research: parseResult(researchResults),
      innovation: parseResult(innovationResults),
      architecture: parseResult(architectureResults),
      backend: parseResult(backendResults),
      frontend: parseResult(frontendResults),
      documentation: parseResult(docsResults),
      blueprint: workflow.projectBlueprint,
      projectState: workflow.projectMemory,
      ...extendedDocs,
    };

    res.json({ success: true, workspace });
  } catch (error: any) {
    mcpLogger.error("WorkspaceRoute", "Failed to get workspace", error);
    res.status(500).json({ error: "Failed to get workspace" });
  }
});

export default router;
