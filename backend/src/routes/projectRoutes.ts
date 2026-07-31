import { Router } from 'express';
import { prisma } from '../server';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';
import { startWorkflow } from '../services/workflowEngine';
import { generateRecommendations } from '../services/dashboardService';

const router = Router();
router.use(verifyFirebaseToken);

// Helper to determine stage from progress
const getStage = (progress: number) => {
  if (progress < 30) return 'Research';
  if (progress < 60) return 'Architecture';
  if (progress < 100) return 'In Progress';
  return 'Completed';
};

// GET /api/projects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { status, stage, search } = req.query;

    const whereClause: any = { userId };

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { idea: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && typeof status === 'string' && status !== 'All') {
      // In the UI, status filters map to stages conceptually, except "All", "In Progress", "Completed"
      if (status === 'Completed') {
        whereClause.overallProgress = { equals: 100 };
      } else if (status === 'In Progress') {
        whereClause.overallProgress = { lt: 100, gt: 0 };
      } else if (status === 'Research') {
        whereClause.overallProgress = { lt: 30 };
      } else if (status === 'Architecture') {
        whereClause.overallProgress = { gte: 30, lt: 60 };
      }
    }

    const workflows = await prisma.workflow.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: { agents: true }
    });

    const projects = workflows.map(w => {
      // Calculate dynamic pseudo-metrics based on agent progress
      const researchAgent = w.agents.find(a => a.name.includes('Research'));
      const researchProgress = researchAgent?.progress || 0;
      
      const currentStage = getStage(w.overallProgress);
      
      return {
        id: w.id,
        title: w.title === 'Generating Title...' ? 'New Project' : w.title,
        description: w.idea || 'No description provided.',
        domain: w.domain || 'Technology',
        status: w.status === 'COMPLETED' || w.overallProgress === 100 ? 'Completed' : 'Active',
        progress: w.overallProgress,
        currentStage: currentStage,
        research: researchProgress,
        innovation: Math.min(100, Math.floor(w.overallProgress * 0.8 + 20)), // derived mock score
        difficulty: w.overallProgress > 80 ? 'Advanced' : 'Intermediate', // derived mock
        lastUpdated: w.updatedAt.toISOString(),
        createdAt: w.createdAt.toISOString()
      };
    });

    res.json({ success: true, projects });
  } catch (err: any) {
    console.error("Error in GET /api/projects:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id as string;
    const workflow = await prisma.workflow.findUnique({
      where: { id_userId: { id, userId } }
    });
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, project: workflow });
  } catch (err: any) {
    console.error("Error in GET /api/projects/:id:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    
    console.log(`[Projects] Creating new project for User: ${userId}`);
    const workflow = await prisma.workflow.create({
      data: {
        title: data.title || "New Project",
        idea: data.description || "Auto-generated project idea.",
        domain: data.domain || "Technology",
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

    // Attempt to start immediately in the background
    startWorkflow(workflow.id);
    
    res.status(201).json({ success: true, project: workflow });
  } catch (err: any) {
    console.error("Error in POST /api/projects:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id as string;
    await prisma.workflow.delete({
      where: { id_userId: { id, userId } }
    });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err: any) {
    console.error("Error in DELETE /api/projects/:id:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
