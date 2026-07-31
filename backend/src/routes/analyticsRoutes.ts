import { Router } from 'express';
import { prisma } from '../server';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';

const router = Router();
router.use(verifyFirebaseToken);

// ─── POST /api/analytics/track-session - Record an AI session ──────────────
router.post('/track-session', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { workflowId, type, language, voiceUsed, llmUsed, tokensUsed } = req.body;

    const session = await prisma.aISession.create({
      data: {
        userId,
        workflowId,
        type: type || 'workflow',
        language,
        voiceUsed: voiceUsed || false,
        llmUsed,
        tokensUsed: tokensUsed || 0,
        estimatedCost: calculateCost(tokensUsed || 0)
      }
    });

    // Update user analytics
    await updateUserAnalytics(userId, 'aiCallsMade');

    res.status(201).json({ success: true, sessionId: session.id });
  } catch (err: any) {
    console.error('[Analytics] Error tracking session:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/analytics/end-session - End an AI session ────────────────────
router.post('/end-session/:sessionId', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { messageCount, tokensUsed } = req.body;

    const session = await prisma.aISession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const endedAt = new Date();
    const duration = endedAt.getTime() - session.startedAt.getTime();

    const updatedSession = await prisma.aISession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        duration,
        messageCount: messageCount || session.messageCount,
        tokensUsed: tokensUsed || session.tokensUsed,
        estimatedCost: calculateCost(tokensUsed || session.tokensUsed)
      }
    });

    res.json({ success: true, session: updatedSession });
  } catch (err: any) {
    console.error('[Analytics] Error ending session:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/analytics/user - Get user analytics ──────────────────────────
router.get('/user', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;

    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    });

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: { userId }
      });
    }

    res.json(analytics);
  } catch (err: any) {
    console.error('[Analytics] Error fetching user analytics:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/analytics/sessions - Get user's AI sessions ──────────────────
router.get('/sessions', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const sessions = await prisma.aISession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit
    });

    res.json(sessions);
  } catch (err: any) {
    console.error('[Analytics] Error fetching sessions:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/analytics/update-innovation-score - Update innovation score ─
router.post('/update-innovation-score', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { score } = req.body;

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0-100' });
    }

    const analytics = await prisma.userAnalytics.update({
      where: { userId },
      data: { innovationScore: score }
    });

    res.json({ success: true, innovationScore: analytics.innovationScore });
  } catch (err: any) {
    console.error('[Analytics] Error updating innovation score:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Helper Functions ──────────────────────────────────────────────────────

async function updateUserAnalytics(userId: string, field: string) {
  try {
    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    });

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: { userId }
      });
    }

    const updateData: any = {};
    updateData[field] = (analytics as any)[field] + 1;

    await prisma.userAnalytics.update({
      where: { userId },
      data: updateData
    });
  } catch (err) {
    console.error('[Analytics] Error updating user analytics:', err);
  }
}

function calculateCost(tokensUsed: number): number {
  // Approximate cost calculation (varies by model)
  // Using $0.00001 per token as estimate
  return tokensUsed * 0.00001;
}

export default router;
