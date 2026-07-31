import { Router } from 'express';
import { prisma } from '../server';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';

const router = Router();
router.use(verifyFirebaseToken);

// ─── GET /api/resources - Get all bookmarked resources ─────────────────────
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const where: any = { userId };
    if (category) where.category = category;

    const total = await prisma.savedResource.count({ where });
    const resources = await prisma.savedResource.findMany({
      where,
      orderBy: { savedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const formatted = resources.map(r => ({
      id: r.id,
      cat: r.category,
      title: r.title,
      tags: parseTags(r.tags),
      difficulty: r.difficulty || 'All',
      color: getCategoryColor(r.category),
      url: r.url,
      description: r.description
    }));

    res.json({
      total,
      page,
      limit,
      resources: formatted
    });
  } catch (err: any) {
    console.error('[Resources] Error fetching resources:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/resources/bookmark - Save a resource ────────────────────────
router.post('/bookmark', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { category, title, url, description, tags, difficulty } = req.body;

    if (!category || !title || !url) {
      return res.status(400).json({ error: 'Missing required fields: category, title, url' });
    }

    // Check if already bookmarked
    const existing = await prisma.savedResource.findUnique({
      where: {
        userId_url: { userId, url }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Resource already bookmarked' });
    }

    const resource = await prisma.savedResource.create({
      data: {
        userId,
        category,
        title,
        url,
        description,
        tags: JSON.stringify(tags || []),
        difficulty
      }
    });

    res.status(201).json({
      success: true,
      resource: {
        id: resource.id,
        cat: resource.category,
        title: resource.title,
        tags: parseTags(resource.tags),
        difficulty: resource.difficulty
      }
    });
  } catch (err: any) {
    console.error('[Resources] Error bookmarking resource:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/resources/:id - Remove a bookmarked resource ──────────────
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const resource = await prisma.savedResource.findUnique({ where: { id } });
    if (!resource || resource.userId !== userId) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await prisma.savedResource.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Resources] Error deleting resource:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/resources/categories - Get resource categories ───────────────
router.get('/categories/list', async (req: AuthRequest, res) => {
  try {
    const categories = [
      'GitHub',
      'Research Papers',
      'Datasets',
      'Courses',
      'Videos',
      'Blogs',
      'API Libraries',
      'Tools'
    ];

    res.json(categories);
  } catch (err: any) {
    console.error('[Resources] Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Helper Functions ──────────────────────────────────────────────────────

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'GitHub': 'from-indigo-500 to-blue-500',
    'Research Papers': 'from-fuchsia-500 to-violet-500',
    'Datasets': 'from-emerald-500 to-teal-500',
    'Courses': 'from-amber-500 to-orange-500',
    'Videos': 'from-sky-500 to-cyan-500',
    'Blogs': 'from-rose-500 to-pink-500',
    'API Libraries': 'from-violet-500 to-indigo-500',
    'Tools': 'from-blue-500 to-cyan-500'
  };
  return colors[category] || 'from-slate-500 to-slate-700';
}

export default router;
