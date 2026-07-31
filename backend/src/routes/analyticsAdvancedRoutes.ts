import { Router } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';
import {
  getKPIMetrics,
  getProjectCreationTrends,
  getProjectStatusDistribution,
  getDomainDistribution,
  getTechStackAnalytics,
  getTopProjects,
  getRecentProjects,
  getProjectInsights,
  getProductivityGraph,
  getResearchTrends,
  getDailyTokenUsage,
  getVoiceAnalytics,
  getRecentActivity,
  getLatestResearch
} from '../services/analyticsService';

const router = Router();
router.use(verifyFirebaseToken);

// ─── KPI METRICS ───────────────────────────────────────────────────────────
/**
 * GET /api/analytics/kpi
 * Returns all KPI cards data
 */
router.get('/kpi', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const data = await getKPIMetrics(userId);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] KPI error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PROJECT CREATION TRENDS ───────────────────────────────────────────────
/**
 * GET /api/analytics/projects/trends?period=weekly
 * Returns project creation trends
 */
router.get('/projects/trends', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const period = (req.query.period as string) || 'weekly';
    const data = await getProjectCreationTrends(userId, period as any);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Project trends error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PROJECT STATUS PIE CHART ──────────────────────────────────────────────
/**
 * GET /api/analytics/projects/status
 * Returns project status distribution
 */
router.get('/projects/status', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const data = await getProjectStatusDistribution(userId);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Status distribution error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── DOMAIN DISTRIBUTION ──────────────────────────────────────────────────
/**
 * GET /api/analytics/domains
 * Returns domain distribution
 */
router.get('/domains', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const data = await getDomainDistribution(userId);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Domain distribution error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── TECH STACK ANALYTICS ──────────────────────────────────────────────────
/**
 * GET /api/analytics/tech-stack
 * Returns tech stack analytics
 */
router.get('/tech-stack', async (req: AuthRequest, res) => {
  try {
    const data = await getTechStackAnalytics(req.user.id);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Tech stack error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── TOP PROJECTS ──────────────────────────────────────────────────────────
/**
 * GET /api/analytics/projects/top?sortBy=completion&limit=5
 * Returns top projects
 */
router.get('/projects/top', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const sortBy = (req.query.sortBy as string) || 'completion';
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await getTopProjects(userId, sortBy as any, limit);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Top projects error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── RECENT PROJECTS ───────────────────────────────────────────────────────
/**
 * GET /api/analytics/projects/recent?limit=10
 * Returns recent projects
 */
router.get('/projects/recent', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await getRecentProjects(userId, limit);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Recent projects error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PROJECT INSIGHTS ──────────────────────────────────────────────────────
/**
 * GET /api/analytics/insights
 * Returns AI-generated insights
 */
router.get('/insights', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const data = await getProjectInsights(userId);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Insights error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PRODUCTIVITY GRAPH ────────────────────────────────────────────────────
/**
 * GET /api/analytics/productivity?weeks=12
 * Returns productivity graph data
 */
router.get('/productivity', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const weeks = parseInt(req.query.weeks as string) || 12;
    const data = await getProductivityGraph(userId, weeks);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Productivity error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── RESEARCH TRENDS ──────────────────────────────────────────────────────
/**
 * GET /api/analytics/research/trends?period=weekly
 * Returns research generation trends
 */
router.get('/research/trends', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const period = (req.query.period as string) || 'weekly';
    const data = await getResearchTrends(userId, period as any);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Research trends error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── TOKEN USAGE ───────────────────────────────────────────────────────────
/**
 * GET /api/analytics/tokens/daily?days=30
 * Returns daily token usage
 */
router.get('/tokens/daily', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days as string) || 30;
    const data = await getDailyTokenUsage(userId, days);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Token usage error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── VOICE ANALYTICS ───────────────────────────────────────────────────────
/**
 * GET /api/analytics/voice
 * Returns voice analytics
 */
router.get('/voice', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const data = await getVoiceAnalytics(userId);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Voice analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── RECENT ACTIVITY ───────────────────────────────────────────────────────
/**
 * GET /api/analytics/activity?limit=20
 * Returns recent activity timeline
 */
router.get('/activity', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await getRecentActivity(userId, limit);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Activity error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── LATEST RESEARCH ───────────────────────────────────────────────────────
/**
 * GET /api/analytics/research/latest?limit=5
 * Returns latest research papers
 */
router.get('/research/latest', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await getLatestResearch(userId, limit);
    res.json(data);
  } catch (err: any) {
    console.error('[Analytics] Latest research error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
