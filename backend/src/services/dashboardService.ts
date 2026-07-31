// @ts-nocheck
import { prisma } from '../server';

/**
 * Dashboard Service
 * Handles all dashboard-related business logic and calculations
 */

// ─── Calculate Dashboard Metrics ─────────────────────────────────────────────

export async function calculateUserMetrics(userId: string) {
  try {
    // Count projects
    const projectsCount = await prisma.workflow.count({
      where: { workflow: { userId } }
    });

    // Count research reports
    const researchCount = await prisma.researchResult.count({
      where: { user: { id: userId } }
    });

    // Count saved resources
    const resourcesCount = await prisma.savedResource.count({
      where: { workflow: { userId } }
    });

    // Count AI sessions
    const sessionsCount = await prisma.aISession.count({
      where: { workflow: { userId } }
    });

    // Count documentation
    const docsCount = await prisma.documentationResult.count({
      where: { workflow: { userId } }
    });

    // Calculate total tokens used
    const sessions = await prisma.aISession.findMany({
      where: { workflow: { userId } },
      select: { tokensUsed: true }
    });
    const totalTokens = sessions.reduce((sum, s) => sum + s.tokensUsed, 0);

    // Calculate innovation score (0-100)
    // Based on: projects created, research depth, architecture quality, etc.
    const innovationScore = calculateInnovationScore({
      projectsCount,
      researchCount,
      docsCount,
      totalTokens
    });

    // Update or create user analytics
    const analytics = await prisma.userAnalytics.upsert({
      where: { workflow: { userId } },
      update: {
        projectsCreated: projectsCount,
        researchGenerated: researchCount,
        aiCallsMade: sessionsCount,
        documentsGenerated: docsCount,
        totalTokensUsed: totalTokens,
        innovationScore,
        lastActiveAt: new Date()
      },
      create: {
        userId,
        projectsCreated: projectsCount,
        researchGenerated: researchCount,
        aiCallsMade: sessionsCount,
        documentsGenerated: docsCount,
        totalTokensUsed: totalTokens,
        innovationScore
      }
    });

    return analytics;
  } catch (err) {
    console.error('[DashboardService] Error calculating metrics:', err);
    throw err;
  }
}

// ─── Update Dashboard Metric Data ────────────────────────────────────────────

export async function updateDashboardMetric(
  userId: string,
  metricName: string,
  value: number,
  dataPoints: number[] = []
) {
  try {
    const previousMetric = await prisma.dashboardMetric.findUnique({
      where: {
        userId_metric: { userId, metric: metricName }
      }
    });

    const previousValue = previousMetric?.value || 0;
    const delta = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;

    const metric = await prisma.dashboardMetric.upsert({
      where: {
        userId_metric: { userId, metric: metricName }
      },
      update: {
        value,
        previousValue,
        delta,
        dataPoints: JSON.stringify(dataPoints)
      },
      create: {
        userId,
        metric: metricName,
        value,
        previousValue: 0,
        delta: 0,
        dataPoints: JSON.stringify(dataPoints)
      }
    });

    return metric;
  } catch (err) {
    console.error('[DashboardService] Error updating metric:', err);
    throw err;
  }
}

// ─── Generate Recommendations ────────────────────────────────────────────────

export async function generateRecommendations(userId: string) {
  try {
    const recommendations: Array<{
      type: string;
      title: string;
      description?: string;
      priority: string;
    }> = [];

    // Get user's workflows
    const workflows = await prisma.workflow.findMany({
      where: { workflow: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Recommendation 1: If user has research in progress, suggest prototyping
    const inProgressWorkflows = workflows.filter(w => w.status === 'RUNNING');
    if (inProgressWorkflows.length > 0) {
      recommendations.push({
        type: 'task',
        title: 'Review generated research from your active projects',
        description: `You have ${inProgressWorkflows.length} project(s) in progress`,
        priority: 'HIGH'
      });
    }

    // Recommendation 2: If user has completed projects, suggest documentation review
    const completedWorkflows = workflows.filter(w => w.status === 'COMPLETED');
    if (completedWorkflows.length > 0) {
      recommendations.push({
        type: 'task',
        title: 'Document your completed projects',
        priority: 'MEDIUM'
      });
    }

    // Recommendation 3: Trending technology research
    const trendingTechs = await prisma.trendingTechnology.findMany({
      orderBy: { mention: 'desc' },
      take: 3
    });

    for (const tech of trendingTechs) {
      recommendations.push({
        type: 'technology',
        title: `Explore ${tech.name} for your next project`,
        priority: 'LOW'
      });
    }

    // Recommendation 4: Upcoming hackathons
    const upcomingHackathons = await prisma.hackathon.findMany({
      where: {
        eventDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        }
      },
      orderBy: { eventDate: 'asc' },
      take: 2
    });

    // Clear old recommendations
    await prisma.recommendation.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() }
      }
    });

    // Create new recommendations
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires tomorrow

    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          userId,
          type: rec.type,
          title: rec.title,
          description: rec.description ?? null,
          priority: rec.priority,
          expiresAt
        }
      });
    }

    return recommendations;
  } catch (err) {
    console.error('[DashboardService] Error generating recommendations:', err);
    throw err;
  }
}

// ─── Record Research Paper ──────────────────────────────────────────────────

export async function recordResearchPaper(
  userId: string,
  title: string,
  authors: string,
  source: string,
  data: {
    url?: string | undefined;
    summary?: string | undefined;
    keywords?: string | undefined;
  }
) {
  try {
    const paper = await prisma.researchPaper.create({
      data: {
        userId,
        title,
        authors,
        source,
        url: data.url ?? null,
        summary: data.summary ?? null,
        keywords: data.keywords ?? null,
        date: new Date()
      }
    });

    return paper;
  } catch (err) {
    console.error('[DashboardService] Error recording research paper:', err);
    throw err;
  }
}

// ─── Track Trending Technologies ────────────────────────────────────────────

export async function trackTrendingTechnology(name: string, category: string = 'AI/ML') {
  try {
    const tech = await prisma.trendingTechnology.upsert({
      where: { name },
      update: { mention: { increment: 1 } },
      create: {
        name,
        category,
        mention: 1
      }
    });

    return tech;
  } catch (err) {
    console.error('[DashboardService] Error tracking technology:', err);
    throw err;
  }
}

// ─── Helper: Calculate Innovation Score ──────────────────────────────────────

function calculateInnovationScore(data: {
  projectsCount: number;
  researchCount: number;
  docsCount: number;
  totalTokens: number;
}): number {
  let score = 0;

  // Base score from projects (up to 30 points)
  score += Math.min(data.projectsCount * 5, 30);

  // Bonus from research depth (up to 25 points)
  score += Math.min(data.researchCount * 4, 25);

  // Documentation quality (up to 20 points)
  score += Math.min(data.docsCount * 3, 20);

  // Complexity from token usage (up to 25 points)
  // Every 1000 tokens = 1 point (capped at 25 points)
  score += Math.min(Math.floor(data.totalTokens / 1000), 25);

  // Cap at 100
  return Math.min(score, 100);
}

// ─── Get Project Statistics ─────────────────────────────────────────────────

export async function getProjectStatistics(userId: string) {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { workflow: { userId } },
      include: {
        agents: true,
        researchResults: true
      }
    });

    const statistics = {
      total: workflows.length,
      byStatus: {
        created: workflows.filter(w => w.status === 'CREATED').length,
        running: workflows.filter(w => w.status === 'RUNNING').length,
        completed: workflows.filter(w => w.status === 'COMPLETED').length,
        failed: workflows.filter(w => w.status === 'FAILED').length
      },
      avgProgress: workflows.length > 0 
        ? Math.round(workflows.reduce((sum, w) => sum + w.overallProgress, 0) / workflows.length)
        : 0,
      recentlyUpdated: workflows.slice(0, 5).map(w => ({
        id: w.id,
        title: w.title,
        status: w.status,
        updatedAt: w.updatedAt
      }))
    };

    return statistics;
  } catch (err) {
    console.error('[DashboardService] Error getting project statistics:', err);
    throw err;
  }
}

// ─── Bulk Update Metrics from Workflow Results ───────────────────────────────

export async function updateMetricsFromWorkflow(workflowId: string) {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        user: true,
        agents: true,
        projectBlueprint: true
      }
    });

    if (!workflow) throw new Error('Workflow not found');

    // Count completed agents
    const completedAgents = workflow.agents.filter(a => a.status === 'COMPLETED').length;
    
    // Check if research was completed
    const hasResearch = await prisma.researchResult.findFirst({
      where: { workflowId }
    });

    // Update user analytics
    await calculateUserMetrics(workflow.userId);

    // Record metrics
    await updateDashboardMetric(
      workflow.userId,
      'total_projects',
      await prisma.workflow.count({ where: { userId: workflow.userId } })
    );

    if (hasResearch) {
      await updateDashboardMetric(
        workflow.userId,
        'research_reports',
        await prisma.researchResult.count({ where: { userId: workflow.userId } })
      );
    }

    return { success: true, completedAgents };
  } catch (err) {
    console.error('[DashboardService] Error updating workflow metrics:', err);
    throw err;
  }
}
