import { Router } from 'express';
import { prisma } from '../server';
import { startWorkflow, retryWorkflowAgent } from '../services/workflowEngine';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';

const router = Router();

// Apply middleware to all routes
router.use(verifyFirebaseToken);

router.post(['/', '/start'], async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;
    
    if (!data.idea || typeof data.idea !== 'string' || !data.idea.trim()) {
      return res.status(400).json({ success: false, message: "Project idea cannot be empty" });
    }
    
    console.log(`[Controller] POST /api/workflows/start - User: ${userId}`);
    const workflow = await prisma.workflow.create({
      data: {
        title: "Generating Title...", // Will be updated by Research Agent
        idea: data.idea,
        status: 'CREATED',
        userId: userId
      }
    });

    const agents = [
      'Research & Discovery', 
      'Innovation & Strategy', 
      'Architecture & Development', 
      'Backend Generation',
      'Frontend Generation',
      'Documentation & Presentation',
      'Testing & Validation',
      'Project Export'
    ];
    for (const name of agents) {
      await prisma.workflowAgent.create({
        data: {
          workflowId: workflow.id,
          name: name,
          status: 'WAITING'
        }
      });
    }

    console.log("Workflow Created");
    
    // Start engine in background
    startWorkflow(workflow.id);

    console.log("Return Response");
    res.status(201).json({ success: true, workflowId: workflow.id });
  } catch (err: any) {
    console.error("Error in POST /api/workflows:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }
});

router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    // Fetch running/waiting tasks for this user's workflows
    const activeAgents = await prisma.workflowAgent.findMany({
      where: {
        status: { in: ['WAITING', 'RUNNING'] },
        workflow: { userId: userId }
      },
      include: { workflow: true }
    });
    
    // Map to frontend task format
    const activeTasks = activeAgents.map(a => ({
      id: a.id,
      agent: a.name,
      title: a.workflow.title + ' - ' + a.name,
      progress: a.status === 'RUNNING' ? 50 : 0,
      eta: a.status === 'RUNNING' ? '~10s' : 'queued',
      status: a.status,
      color: a.name.includes('Research') ? 'from-blue-500 to-indigo-500' : 'from-slate-500 to-slate-700'
    }));

    const logs = await prisma.workflowLog.findMany({
      where: { workflow: { userId: userId } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const analytics = await prisma.analytics.findMany({
      where: { userId: userId }
    });

    res.json({
      activeTasks,
      liveActivity: logs,
      analytics
    });
  } catch (err: any) {
    console.error("Error in GET /api/workflows/dashboard:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }
});

router.post('/:id/retry', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { agentName } = req.body;
    
    const workflow = await prisma.workflow.findUnique({ where: { id: String(id) } });
    if (!workflow || workflow.userId !== req.user.id) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflowId = String(id);
    retryWorkflowAgent(workflowId, agentName);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/download/:type', async (req: AuthRequest, res) => {
  // Mock endpoint that would normally build a zip and stream it
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.type}.zip"`);
  res.send('mock-zip-content');
});

router.get('/:id/blueprint', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const blueprint = await prisma.projectBlueprint.findUnique({
      where: { workflowId: String(id) }
    });
    
    if (!blueprint) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }
    
    res.json(blueprint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/approve-blueprint', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.workflow.findUnique({ where: { id: String(id) } });
    if (!workflow || workflow.userId !== req.user.id) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await prisma.projectBlueprint.update({
      where: { workflowId: String(id) },
      data: { 
        approvedAt: new Date(),
        approvedBy: req.user.id
      }
    });

    await prisma.workflow.update({
      where: { id: String(id) },
      data: { status: 'COMPLETED' }
    });

    // Do NOT generate code yet. That belongs to the next phase.
    // import('../services/workflowEngine').then(m => m.startWorkflow(id, 'Backend Generation'));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/modify-blueprint', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { instructions } = req.body;
    
    const workflow = await prisma.workflow.findUnique({ where: { id: String(id) } });
    if (!workflow || workflow.userId !== req.user.id) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Reset Architecture Agent to WAITING so it can run again
    await prisma.workflowAgent.updateMany({
      where: { workflowId: String(id), name: 'Architecture & Development' },
      data: { status: 'WAITING', progress: 0 }
    });

    await prisma.workflow.update({
      where: { id: String(id) },
      data: { status: 'RUNNING', idea: workflow.idea + `\n\nArchitecture Modifications requested: ${instructions}` }
    });

    // Run only the Architecture Agent
    startWorkflow(String(id), 'Architecture & Development');

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.workflow.findUnique({
      where: { id: String(id) },
      include: {
        agents: true,
        logs: { orderBy: { createdAt: 'desc' }, take: 50 }
      }
    });

    if (!workflow || workflow.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    res.json({
      success: true,
      status: workflow.status,
      overallProgress: workflow.overallProgress,
      currentAgent: workflow.currentAgent,
      workflow: {
        id: workflow.id,
        title: workflow.title,
        idea: workflow.idea,
        status: workflow.status,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      },
      agents: workflow.agents.map(a => ({
        name: a.name,
        status: a.status,
        progress: a.progress,
        currentTask: a.currentTask,
      })),
      logs: workflow.logs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/result', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.workflow.findUnique({ where: { id: String(id) } });

    if (!workflow || workflow.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    const research = await prisma.researchResult.findFirst({ where: { workflowId: String(id) }, orderBy: { createdAt: 'desc' } });
    const innovation = await prisma.innovationResult.findFirst({ where: { workflowId: String(id) }, orderBy: { createdAt: 'desc' } });
    const architecture = await prisma.architectureResult.findFirst({ where: { workflowId: String(id) }, orderBy: { createdAt: 'desc' } });
    const documentation = await prisma.documentationResult.findFirst({ where: { workflowId: String(id) }, orderBy: { createdAt: 'desc' } });
    const analysis = await prisma.analysisResult.findFirst({ where: { workflowId: String(id) }, orderBy: { createdAt: 'desc' } });

    res.json({
      success: true,
      workflow: { title: workflow.title, status: workflow.status },
      research: research ? JSON.parse(research.content) : null,
      innovation: innovation ? JSON.parse(innovation.content) : null,
      architecture: architecture ? JSON.parse(architecture.content) : null,
      documentation: documentation ? JSON.parse(documentation.content) : null,
      analysis: analysis ? JSON.parse(analysis.content) : null
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
