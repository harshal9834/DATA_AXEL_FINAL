/**
 * researchWorkspaceService.ts
 * 
 * PHASE 1: Research Workspace Foundation (No AI yet)
 * 
 * This is the clean foundation for Phase 1.
 * Phase 2 will extend these service methods to integrate Gemini API.
 * 
 * Current behavior:
 * - Creates empty workspaces with no AI generation
 * - Returns empty items (papers, repos, datasets)
 * - All diagrams and documents are null/empty
 * - Progress stays at 0%
 * - Status is "CREATED" (ready for Phase 2 to move to "RESEARCHING")
 */

import { prisma } from '../server';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResearchGenerationStage {
  name: string;
  message: string;
  order: number;
}

/**
 * PHASE 1: Placeholder stages. 
 * Phase 2 will execute these when Gemini integration is added.
 */
export const RESEARCH_STAGES: ResearchGenerationStage[] = [
  { name: 'Understanding Problem', message: 'Analyzing problem statement...', order: 1 },
  { name: 'Researching', message: 'Researching solutions...', order: 2 },
  { name: 'Finding Research Papers', message: 'Searching for academic papers...', order: 3 },
  { name: 'Searching GitHub', message: 'Finding relevant repositories...', order: 4 },
  { name: 'Searching Datasets', message: 'Discovering relevant datasets...', order: 5 },
  { name: 'Generating Architecture', message: 'Designing system architecture...', order: 6 },
  { name: 'Generating ER Diagram', message: 'Creating database schema...', order: 7 },
  { name: 'Generating Flow Diagram', message: 'Mapping system workflows...', order: 8 },
  { name: 'Writing Documentation', message: 'Generating technical documentation...', order: 9 },
  { name: 'Generating SRS', message: 'Creating requirements specification...', order: 10 },
  { name: 'Creating PDF Export', message: 'Exporting to PDF...', order: 11 },
  { name: 'Finalizing', message: 'Finalizing workspace...', order: 12 },
];

// ─── PHASE 1: Placeholder Generation Functions ────────────────────────────────
// Phase 2 will replace these with actual Gemini API calls.
// Current behavior: Return empty results (foundation ready for extension)

export async function generateResearch(): Promise<string> {
  // Phase 2: Implement Gemini call
  return '';
}

export async function generateArchitecture(): Promise<string> {
  // Phase 2: Implement Mermaid architecture diagram generation
  return '';
}

export async function generateERDiagram(): Promise<string> {
  // Phase 2: Implement Mermaid ER diagram generation
  return '';
}

export async function generateFlowDiagram(): Promise<string> {
  // Phase 2: Implement Mermaid flow diagram generation
  return '';
}

export async function generateDocumentation(): Promise<string> {
  // Phase 2: Implement technical documentation generation
  return '';
}

export async function generateSRS(): Promise<string> {
  // Phase 2: Implement SRS document generation
  return '';
}

export async function findResearchPapers(): Promise<any[]> {
  // Phase 2: Implement research paper discovery
  return [];
}

export async function findGitHubRepositories(): Promise<any[]> {
  // Phase 2: Implement GitHub repository discovery
  return [];
}

export async function findDatasets(): Promise<any[]> {
  // Phase 2: Implement dataset discovery
  return [];
}

// ─── Main Research Workspace Creation (Phase 1: No AI) ────────────────────────
/**
 * PHASE 1: Creates an empty workspace with no AI generation
 * 
 * Behavior:
 * - Creates workspace with status = 'CREATED' (not 'RESEARCHING')
 * - Progress = 0%, currentStage = null
 * - All content fields are null
 * - No items (papers, repos, datasets)
 * - Returns immediately
 * - No background processes
 * 
 * Phase 2 will:
 * - Call Gemini API to generate research
 * - Create ResearchStageItems for tracking
 * - Update progress
 * - Change status to 'RESEARCHING' then 'COMPLETED'
 */
export async function createResearchWorkspace(
  userId: string,
  projectName: string,
  problemStatement: string,
  existingWorkspaceId?: string,
  onStageUpdate?: (stage: string, progress: number) => void
): Promise<string> {
  try {
    // Create or reuse workspace
    let workspace: { id: string };
    if (existingWorkspaceId) {
      workspace = { id: existingWorkspaceId };
    } else {
      workspace = await prisma.researchWorkspace.create({
        data: {
          userId,
          projectName,
          problemStatement,
          status: 'CREATED', // Phase 1: Ready state, not generating
          progress: 0, // No progress until Phase 2 runs AI
          currentStage: null,
          totalStages: RESEARCH_STAGES.length,
          // All content is null until Phase 2
          research: null,
          architecture: null,
          erDiagram: null,
          flowDiagram: null,
          documentation: null,
          srsDocument: null,
          documentationPdfUrl: null,
          srsPdfUrl: null,
        },
      });
    }

    console.log(`[ResearchWorkspace] ✅ PHASE 1: Created empty workspace ${workspace.id} for user ${userId}`);
    return workspace.id;
  } catch (error: any) {
    console.error('[ResearchWorkspace] ❌ Error creating research workspace:', error.message);
    throw error;
  }
}

// ─── Fetch Workspace ──────────────────────────────────────────────────────────

export async function getResearchWorkspace(workspaceId: string) {
  return prisma.researchWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      items: true,
      stages: true,
    },
  });
}

// ─── List User Workspaces ─────────────────────────────────────────────────────

export async function listUserWorkspaces(userId: string, limit: number = 20) {
  return prisma.researchWorkspace.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      _count: {
        select: { items: true, stages: true },
      },
    },
  });
}
