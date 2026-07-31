import { prisma } from '../server.js';
import { calculateUserMetrics, trackTrendingTechnology, recordResearchPaper } from './dashboardService.js';

/**
 * Event Tracking Service
 * Listens to workflow events and updates analytics/metrics accordingly
 */

export async function onWorkflowStarted(workflowId: string, userId: string) {
  try {
    console.log(`[EventTracking] Workflow started: ${workflowId}`);
    
    // Track analytics
    const session = await prisma.aISession.create({
      data: {
        userId,
        workflowId,
        type: 'workflow'
      }
    });

    return session;
  } catch (err) {
    console.error('[EventTracking] Error on workflow started:', err);
  }
}

export async function onWorkflowCompleted(workflowId: string, userId: string) {
  try {
    console.log(`[EventTracking] Workflow completed: ${workflowId}`);

    // End active session
    const session = await prisma.aISession.findFirst({
      where: { workflowId, endedAt: null }
    });

    if (session) {
      await prisma.aISession.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          duration: Date.now() - session.startedAt.getTime()
        }
      });
    }

    // Recalculate user metrics
    await calculateUserMetrics(userId);

    // Extract trending technologies from results
    await extractAndTrackTrendingTechs(workflowId);

    // Generate new recommendations
    const { generateRecommendations } = await import('./dashboardService');
    await generateRecommendations(userId);

    console.log(`[EventTracking] Metrics updated for user: ${userId}`);
  } catch (err) {
    console.error('[EventTracking] Error on workflow completed:', err);
  }
}

export async function onResearchGenerated(workflowId: string, userId: string, content: any) {
  try {
    console.log(`[EventTracking] Research generated for workflow: ${workflowId}`);

    // Extract paper references from research
    if (content && typeof content === 'object') {
      const papers = extractPapers(content);
      
      for (const paper of papers) {
        await recordResearchPaper(
          userId,
          paper.title,
          paper.authors,
          paper.source,
          { summary: paper.summary, url: paper.url }
        );
      }
    }

    // Track event
    await prisma.workflowLog.create({
      data: {
        workflowId,
        title: 'Research Generated',
        detail: 'Research results generated and saved',
        icon: 'BookOpen',
        color: 'blue'
      }
    });
  } catch (err) {
    console.error('[EventTracking] Error on research generated:', err);
  }
}

export async function onWorkflowFailed(workflowId: string, error: string) {
  try {
    console.log(`[EventTracking] Workflow failed: ${workflowId}, error: ${error}`);

    // End session
    const session = await prisma.aISession.findFirst({
      where: { workflowId, endedAt: null }
    });

    if (session) {
      await prisma.aISession.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          duration: Date.now() - session.startedAt.getTime()
        }
      });
    }

    // Log failure
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (workflow) {
      await prisma.workflowLog.create({
        data: {
          workflowId,
          title: 'Workflow Failed',
          detail: error,
          icon: 'AlertCircle',
          color: 'red'
        }
      });
    }
  } catch (err) {
    console.error('[EventTracking] Error on workflow failed:', err);
  }
}

// ─── Helper Functions ──────────────────────────────────────────────────────

async function extractAndTrackTrendingTechs(workflowId: string) {
  try {
    // Extract from all results
    const results = await Promise.all([
      prisma.researchResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } }),
      prisma.architectureResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } }),
      prisma.backendResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } }),
      prisma.frontendResult.findFirst({ where: { workflowId }, orderBy: { createdAt: 'desc' } })
    ]);

    const techs = new Set<string>();

    for (const result of results) {
      if (result?.content) {
        try {
          const content = JSON.parse(result.content);
          const extractedTechs = extractTechFromContent(content);
          extractedTechs.forEach(t => techs.add(t));
        } catch (e) {
          // Content is not JSON, skip parsing
        }
      }
    }

    // Track each technology
    for (const tech of techs) {
      await trackTrendingTechnology(tech);
    }
  } catch (err) {
    console.error('[EventTracking] Error extracting trending techs:', err);
  }
}

function extractTechFromContent(content: any): string[] {
  const techs: string[] = [];
  const commonTechs = [
    'React', 'Vue', 'Angular', 'TypeScript', 'Python', 'Node.js', 'Express',
    'PostgreSQL', 'MongoDB', 'Firebase', 'AWS', 'Docker', 'Kubernetes',
    'GraphQL', 'REST API', 'Machine Learning', 'LLM', 'GPT', 'BERT',
    'TensorFlow', 'PyTorch', 'Transformers', 'LSTM', 'CNN', 'GAN',
    'Microservices', 'Serverless', 'Cloud Computing', 'Edge Computing'
  ];

  if (typeof content === 'string') {
    const contentStr = content.toLowerCase();
    for (const tech of commonTechs) {
      if (contentStr.includes(tech.toLowerCase())) {
        techs.push(tech);
      }
    }
  } else if (typeof content === 'object') {
    const str = JSON.stringify(content).toLowerCase();
    for (const tech of commonTechs) {
      if (str.includes(tech.toLowerCase())) {
        techs.push(tech);
      }
    }
  }

  return Array.from(new Set(techs));
}

function extractPapers(content: any): Array<{
  title: string;
  authors: string;
  source: string;
  summary?: string;
  url?: string;
}> {
  const papers: Array<{
    title: string;
    authors: string;
    source: string;
    summary?: string;
    url?: string;
  }> = [];

  // Look for common paper reference patterns
  if (content && typeof content === 'object') {
    // Check for papers array
    if (Array.isArray(content.papers)) {
      papers.push(...content.papers);
    }
    // Check for references array
    if (Array.isArray(content.references)) {
      papers.push(...content.references);
    }
    // Recursively check nested objects
    for (const key in content) {
      if (typeof content[key] === 'object' && content[key] !== null) {
        papers.push(...extractPapers(content[key]));
      }
    }
  }

  // Deduplicate by title
  const uniquePapers = Array.from(
    new Map(papers.map(p => [p.title, p])).values()
  );

  return uniquePapers.slice(0, 5); // Limit to 5 papers
}

export default {
  onWorkflowStarted,
  onWorkflowCompleted,
  onResearchGenerated,
  onWorkflowFailed,
  extractAndTrackTrendingTechs,
  extractTechFromContent,
  extractPapers
};
