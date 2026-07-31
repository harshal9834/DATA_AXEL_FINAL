import { Router } from 'express';
import { prisma } from '../server';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';

const router = Router();
router.use(verifyFirebaseToken);

// ─── GET /api/dashboard/minimal/summary ──────────────────────────────────────
router.get('/minimal/summary', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const [workflows, aiSessionsCount] = await Promise.all([
      prisma.workflow.findMany({ where: { userId }, select: { status: true } }),
      prisma.aISession.count({ where: { userId } })
    ]);

    const totalProjects = workflows.length;
    const activeProjects = workflows.filter(w => w.status === 'RUNNING').length;
    const completedProjects = workflows.filter(w => w.status === 'COMPLETED').length;
    const draftProjects = workflows.filter(w => w.status === 'CREATED').length;

    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      draftProjects,
      aiSessionsCount
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/dashboard/minimal/intelligence ─────────────────────────────────
router.get('/minimal/intelligence', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { logs: true } } }
    });

    if (workflows.length === 0) {
      return res.json({ bestProject: null });
    }

    // Best Project
    const bestProject = [...workflows].sort((a, b) => 
      (b.overallProgress + b._count.logs) - (a.overallProgress + a._count.logs)
    )[0];

    // Needs Attention (Oldest updated among non-completed)
    const activeWorkflows = workflows.filter(w => w.status !== 'COMPLETED');
    const needsAttention = activeWorkflows.length > 0 
      ? [...activeWorkflows].sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())[0]
      : null;

    // Overall Completion
    const overallCompletion = Math.round(
      workflows.reduce((sum, w) => sum + w.overallProgress, 0) / workflows.length
    );

    // Suggested Next Action
    let suggestedAction = 'Start a new project';
    if (needsAttention) {
      if (needsAttention.overallProgress < 20) suggestedAction = `Generate Research for ${needsAttention.title}`;
      else if (needsAttention.overallProgress < 50) suggestedAction = `Generate Architecture for ${needsAttention.title}`;
      else suggestedAction = `Review Code for ${needsAttention.title}`;
    }

    // Upcoming Deadline (Simulated 7 days from last activity if active)
    const upcomingDeadline = needsAttention 
      ? new Date(needsAttention.updatedAt.getTime() + 7 * 86400000).toLocaleDateString()
      : 'No pending deadlines';

    res.json({
      bestProject: {
        title: bestProject.title,
        progress: bestProject.overallProgress
      },
      needsAttention: needsAttention ? {
        title: needsAttention.title,
        issue: needsAttention.overallProgress < 50 ? 'Architecture Pending' : 'Frontend Pending'
      } : null,
      overallCompletion,
      suggestedAction,
      upcomingDeadline
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/dashboard/minimal/analytics ────────────────────────────────────
router.get('/minimal/analytics', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      select: { createdAt: true, status: true }
    });

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const growthData = Array(12).fill(0);
    
    workflows.forEach(w => {
      growthData[w.createdAt.getMonth()]++;
    });

    const statusMap: Record<string, number> = {
      'CREATED': 0,
      'RUNNING': 0,
      'COMPLETED': 0,
      'FAILED': 0
    };
    workflows.forEach(w => {
      if (statusMap[w.status] !== undefined) statusMap[w.status]++;
    });

    res.json({
      projectsGrowth: growthData.map((val, i) => ({ month: monthNames[i], projects: val })),
      statusDistribution: [
        { name: 'Completed', value: statusMap['COMPLETED'] },
        { name: 'Running', value: statusMap['RUNNING'] },
        { name: 'Draft', value: statusMap['CREATED'] },
        { name: 'Failed', value: statusMap['FAILED'] }
      ].filter(item => item.value > 0)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/dashboard/minimal/projects ─────────────────────────────────────
router.get('/minimal/projects', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    res.json(workflows.map(w => ({
      id: w.id,
      title: w.title,
      domain: w.domain || 'Uncategorized',
      status: w.status,
      progress: w.overallProgress,
      lastUpdated: w.updatedAt
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/dashboard/minimal/activity ─────────────────────────────────────
router.get('/minimal/activity', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const logs = await prisma.workflowLog.findMany({
      where: { workflow: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { workflow: { select: { title: true } } }
    });

    res.json(logs.map(l => ({
      id: l.id,
      project: l.workflow.title,
      title: l.title,
      time: l.createdAt
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
