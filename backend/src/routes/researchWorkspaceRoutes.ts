import { Router } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';
import { prisma, io } from '../server';
import {
  createResearchWorkspace,
  getResearchWorkspace,
  listUserWorkspaces,
} from '../services/researchService';

const router = Router();
router.use(verifyFirebaseToken);

// ─── CREATE RESEARCH WORKSPACE ────────────────────────────────────────────────
/**
 * POST /api/research-workspace/create
 * Creates a new AI research workspace and starts generation
 */
router.post('/create', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { projectName, problemStatement } = req.body;

    if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required field: projectName (must be a non-empty string)',
      });
    }
    if (!problemStatement || typeof problemStatement !== 'string' || problemStatement.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required field: problemStatement (must be a non-empty string)',
      });
    }

    // ── Step 1: Create the workspace record immediately so we can return the ID ──
    const workspace = await prisma.researchWorkspace.create({
      data: {
        userId,
        projectName: projectName.trim(),
        problemStatement: problemStatement.trim(),
        status: 'RESEARCHING',
        totalStages: 1,
        progress: 0,
        currentStage: 'Generating Comprehensive Research...',
      },
    });

    console.log(`[ResearchWorkspace] Created workspace ${workspace.id} for user ${userId}`);

    // ── Step 2: Return immediately so the client isn't blocked ──────────────────
    res.status(201).json({
      success: true,
      workspaceId: workspace.id,
      message: 'Research workspace created. AI generation started in background.',
    });

    // ── Step 3: Run the full AI pipeline in background (fire-and-forget) ────────
    createResearchWorkspace(userId, projectName.trim(), problemStatement.trim())
      .then(() => {
        console.log(`[ResearchWorkspace] ✅ Background generation completed for ${workspace.id}`);
      })
      .catch(async (err: any) => {
        console.error(`[ResearchWorkspace] ❌ Background generation failed for ${workspace.id}:`, err.message);
        try {
          await prisma.researchWorkspace.update({
            where: { id: workspace.id },
            data: { status: 'FAILED', error: err.message },
          });
        } catch (_) {}
      });

  } catch (err: any) {
    console.error('[ResearchWorkspace] Create error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// ─── GET RESEARCH WORKSPACE ───────────────────────────────────────────────────
/**
 * GET /api/research-workspace/:workspaceId
 * Retrieves a specific research workspace with all its content
 */
router.get('/:workspaceId', async (req: AuthRequest, res) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const userId = req.user.id;

    const workspace = await getResearchWorkspace(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Verify ownership
    if (workspace.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(workspace);
  } catch (err: any) {
    console.error('[ResearchWorkspace] Get error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── LIST USER WORKSPACES ────────────────────────────────────────────────────
/**
 * GET /api/research-workspace
 * Lists all research workspaces for the current user
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const workspaces = await listUserWorkspaces(userId, limit);

    res.json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (err: any) {
    console.error('[ResearchWorkspace] List error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── BOOKMARK RESEARCH ITEM ──────────────────────────────────────────────────
/**
 * POST /api/research-workspace/:itemId/bookmark
 * Saves a research item to bookmarks
 */
router.post('/:itemId/bookmark', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const item = await prisma.researchWorkspaceItem.findUnique({
      where: { id: itemId },
      include: { workspace: true },
    });

    if (!item) {
      return res.status(404).json({ error: 'Research item not found' });
    }

    // Verify ownership
    if (item.workspace.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Save as bookmarked resource
    const categoryMap: Record<string, string> = {
      PAPER: 'Research Paper',
      GITHUB: 'GitHub',
      DATASET: 'Dataset',
    };

    const savedResource = await prisma.savedResource.create({
      data: {
        userId,
        category: categoryMap[item.type] || item.type,
        title: item.title,
        url: item.url || '',
        description: item.description || null,
        tags: JSON.stringify([
          'research-workspace',
          item.workspace.projectName,
          item.type.toLowerCase(),
        ]),
      },
    });

    res.json({
      success: true,
      resourceId: savedResource.id,
      message: 'Item bookmarked successfully',
    });
  } catch (err: any) {
    console.error('[ResearchWorkspace] Bookmark error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
