import { prisma, io } from '../server';
import { onWorkflowCompleted, onWorkflowFailed } from './eventTracking';
import { ResearchAgent } from './agents/researchAgent';
import { InnovationAgent } from './agents/innovationAgent';
import { ArchitectureAgent } from './agents/architectureAgent';
import { DocumentationAgent } from './agents/documentationAgent';
import { AnalysisAgent } from './agents/analysisAgent';

const AGENT_ORDER = [
  'Research & Discovery',
  'Innovation & Strategy',
  'Architecture & Development',
  'Documentation & Presentation',
  'Project Analysis',
];

const AGENT_PROGRESS_MAP: Record<string, number> = {
  'Research & Discovery': 20,
  'Innovation & Strategy': 40,
  'Architecture & Development': 60,
  'Documentation & Presentation': 80,
  'Project Analysis': 100,
};

async function emitLog(workflowId: string, agentName: string, message: string, color: string = 'blue') {
  const log = await prisma.workflowLog.create({
    data: { workflowId, agentName, level: color === 'green' ? 'success' : 'info', title: message, detail: message, icon: 'Activity', color },
  });
  io.emit('log_created', { ...log, workflowId });
}

async function parseOrFallback(content: string): Promise<any> {
  try {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1) return JSON.parse(content.substring(start, end + 1));
    return JSON.parse(content);
  } catch {
    return { markdown: content };
  }
}

export async function retryWorkflowAgent(workflowId: string, agentName: string) {
  await prisma.workflowAgent.updateMany({
    where: { workflowId, name: agentName },
    data: { status: 'WAITING', progress: 0, error: null },
  });
  await startWorkflow(workflowId, agentName);
}

export async function startWorkflow(workflowId: string, resumeFromAgent?: string) {
  console.log(`[WorkflowEngine] Starting workflow: ${workflowId}`);

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { agents: true },
    });
    if (!workflow) throw new Error('Workflow not found');

    if (!resumeFromAgent) {
      await prisma.workflow.update({ where: { id: workflowId }, data: { status: 'RUNNING', overallProgress: 0 } });
      io.emit('workflow_started', { id: workflowId, status: 'RUNNING', overallProgress: 0 });
    }

    await emitLog(workflowId, 'System', `Workflow started for: "${workflow.idea}"`, 'blue');

    let startExecution = !resumeFromAgent;

    // Accumulated data from prior agents
    let researchData: any = null;
    let innovationData: any = null;
    let architectureData: any = null;
    let documentationData: any = null;

    // If resuming, restore previously saved data
    if (resumeFromAgent) {
      const savedResearch = await prisma.researchResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } });
      const savedInnovation = await prisma.innovationResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } });
      const savedArch = await prisma.architectureResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } });
      const savedDocs = await prisma.documentationResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } });

      if (savedResearch) researchData = await parseOrFallback(savedResearch.content);
      if (savedInnovation) innovationData = await parseOrFallback(savedInnovation.content);
      if (savedArch) architectureData = await parseOrFallback(savedArch.content);
      if (savedDocs) documentationData = await parseOrFallback(savedDocs.content);
    }

    for (const agentName of AGENT_ORDER) {
      if (resumeFromAgent === agentName) startExecution = true;
      if (!startExecution) continue;

      console.log(`[WorkflowEngine] Executing: ${agentName}`);

      let agent = workflow.agents.find(a => a.name === agentName);
      if (!agent) {
        agent = await prisma.workflowAgent.create({ data: { workflowId, name: agentName, status: 'WAITING' } });
      }

      await prisma.workflowAgent.update({
        where: { id: agent.id },
        data: { status: 'RUNNING', startedAt: new Date(), error: null, progress: 5 },
      });

      io.emit('agent_started', { id: agent.id, name: agentName });

      const progressPct = (AGENT_PROGRESS_MAP[agentName] ?? 10) - 10;
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { overallProgress: progressPct, currentAgent: agentName },
      });
      io.emit('workflow_progress', { id: workflowId, overallProgress: progressPct, currentAgent: agentName });

      await emitLog(workflowId, agentName, `${agentName} started`, 'blue');

      try {
        let output: any = null;

        // ─── Research Agent ─────────────────────────────────────────────
        if (agentName === 'Research & Discovery') {
          const a = new ResearchAgent();
          output = await a.execute({
            workflowId, agentId: agent.id,
            projectTitle: workflow.idea.substring(0, 80),
            problemStatement: workflow.idea,
          });
          researchData = output;
          // upsert so retries don't fail on unique constraint
          await prisma.researchResult.upsert({
            where: { workflowId },
            create: { workflowId, userId: workflow.userId, content: JSON.stringify(output) },
            update: { content: JSON.stringify(output) },
          });
        }

        // ─── Innovation Agent ────────────────────────────────────────────
        else if (agentName === 'Innovation & Strategy') {
          if (!researchData) {
            const saved = await prisma.researchResult.findFirst({ where: { workflowId } });
            researchData = saved ? await parseOrFallback(saved.content) : { executiveSummary: workflow.idea, keyFeatures: [], technologies: [], researchGaps: [], researchPapers: [], githubRepositories: [], datasets: [], apis: [], technologyTrends: [] };
          }
          const a = new InnovationAgent();
          output = await a.execute({ workflowId, agentId: agent.id, researchData });
          innovationData = output;
          await prisma.innovationResult.upsert({
            where: { workflowId },
            create: { workflowId, userId: workflow.userId, content: JSON.stringify(output) },
            update: { content: JSON.stringify(output) },
          });
        }

        // ─── Architecture Agent ──────────────────────────────────────────
        else if (agentName === 'Architecture & Development') {
          if (!researchData) {
            const saved = await prisma.researchResult.findFirst({ where: { workflowId } });
            researchData = saved ? await parseOrFallback(saved.content) : { executiveSummary: workflow.idea, keyFeatures: [], technologies: [], researchGaps: [], researchPapers: [], githubRepositories: [], datasets: [], apis: [], technologyTrends: [] };
          }
          if (!innovationData) {
            const saved = await prisma.innovationResult.findFirst({ where: { workflowId } });
            innovationData = saved ? await parseOrFallback(saved.content) : { innovationScore: 85, swot: '', businessModelSummary: '', roadmap: '' };
          }
          const a = new ArchitectureAgent();
          output = await a.execute({ workflowId, agentId: agent.id, projectIdea: workflow.idea, researchData, innovationData });
          architectureData = output;
          await prisma.architectureResult.upsert({
            where: { workflowId },
            create: { workflowId, userId: workflow.userId, content: JSON.stringify(output) },
            update: { content: JSON.stringify(output) },
          });
        }

        // ─── Documentation Agent ─────────────────────────────────────────
        else if (agentName === 'Documentation & Presentation') {
          if (!researchData) {
            const saved = await prisma.researchResult.findFirst({ where: { workflowId } });
            researchData = saved ? await parseOrFallback(saved.content) : { executiveSummary: workflow.idea, keyFeatures: [], technologies: [], researchGaps: [], researchPapers: [], githubRepositories: [], datasets: [], apis: [], technologyTrends: [] };
          }
          if (!innovationData) {
            const saved = await prisma.innovationResult.findFirst({ where: { workflowId } });
            innovationData = saved ? await parseOrFallback(saved.content) : { innovationScore: 85 };
          }
          if (!architectureData) {
            const saved = await prisma.architectureResult.findFirst({ where: { workflowId } });
            architectureData = saved ? await parseOrFallback(saved.content) : { techStack: 'React, Node.js, PostgreSQL', apiEndpoints: [], databaseTables: [], securityChecklist: [] };
          }
          const a = new DocumentationAgent();
          output = await a.execute({ workflowId, agentId: agent.id, projectIdea: workflow.idea, researchData, innovationData, architectureData });
          documentationData = output;
          await prisma.documentationResult.upsert({
            where: { workflowId },
            create: { workflowId, userId: workflow.userId, content: JSON.stringify(output) },
            update: { content: JSON.stringify(output) },
          });
        }

        // ─── Analysis Agent ──────────────────────────────────────────────
        else if (agentName === 'Project Analysis') {
          if (!researchData) {
            const saved = await prisma.researchResult.findFirst({ where: { workflowId } });
            researchData = saved ? await parseOrFallback(saved.content) : {};
          }
          if (!innovationData) {
            const saved = await prisma.innovationResult.findFirst({ where: { workflowId } });
            innovationData = saved ? await parseOrFallback(saved.content) : {};
          }
          if (!architectureData) {
            const saved = await prisma.architectureResult.findFirst({ where: { workflowId } });
            architectureData = saved ? await parseOrFallback(saved.content) : {};
          }
          if (!documentationData) {
            const saved = await prisma.documentationResult.findFirst({ where: { workflowId } });
            documentationData = saved ? await parseOrFallback(saved.content) : {};
          }
          const a = new AnalysisAgent();
          output = await a.execute({ workflowId, agentId: agent.id, projectIdea: workflow.idea, researchData, innovationData, architectureData, documentationData });
          await prisma.analysisResult.upsert({
            where: { workflowId },
            create: { workflowId, userId: workflow.userId, content: JSON.stringify(output) },
            update: { content: JSON.stringify(output) },
          });
        }

        // ─── Mark done ───────────────────────────────────────────────────
        await prisma.workflowAgent.update({
          where: { id: agent.id },
          data: { status: 'COMPLETED', progress: 100, outputJson: JSON.stringify(output), completedAt: new Date() },
        });
        io.emit('agent_completed', { id: agent.id, name: agentName, output });
        await emitLog(workflowId, agentName, `${agentName} completed successfully`, 'green');

        // Update overall progress to the agent's target
        await prisma.workflow.update({
          where: { id: workflowId },
          data: { overallProgress: AGENT_PROGRESS_MAP[agentName] ?? 0 },
        });
        io.emit('workflow_progress', { id: workflowId, overallProgress: AGENT_PROGRESS_MAP[agentName], currentAgent: agentName });

      } catch (err: any) {
        console.error(`[WorkflowEngine] Error in ${agentName}:`, err.message);

        await prisma.workflowAgent.update({
          where: { id: agent.id },
          data: { status: 'FAILED', error: err.message, completedAt: new Date() },
        });
        io.emit('agent_failed', { id: agent.id, name: agentName, error: err.message });
        await prisma.workflow.update({ where: { id: workflowId }, data: { status: 'FAILED' } });
        io.emit('workflow_failed', { id: workflowId, error: err.message });
        await emitLog(workflowId, agentName, `${agentName} failed: ${err.message}`, 'red');
        
        // Trigger failure tracking if it exists
        if (typeof onWorkflowFailed !== 'undefined') {
          await onWorkflowFailed(workflowId, err.message);
        }
        
        return;
      }
    }

    // ── All agents done ────────────────────────────────────────────────────
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'COMPLETED', overallProgress: 100, currentAgent: null },
    });
    io.emit('workflow_completed', { id: workflowId, status: 'COMPLETED', overallProgress: 100 });
    await emitLog(workflowId, 'System', 'All agents completed. Workflow finished.', 'green');
    console.log(`[WorkflowEngine] Completed: ${workflowId}`);
    
    // Trigger analytics update
    if (typeof onWorkflowCompleted !== 'undefined') {
      await onWorkflowCompleted(workflowId, workflow.userId);
    }

  } catch (err: any) {
    console.error('[WorkflowEngine] Fatal:', err.message);
    try {
      await prisma.workflow.update({ where: { id: workflowId }, data: { status: 'FAILED' } });
    } catch {}
    io.emit('workflow_failed', { id: workflowId, error: err.message });
  }
}
