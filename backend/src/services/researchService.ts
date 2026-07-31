/**
 * researchService.ts
 * 
 * Simplified AI Research Workspace Pipeline
 * Single Gemini API call returning structured JSON.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma, io } from '../server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('[Research] ❌ GEMINI_API_KEY is not set!');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// ─── Gemini Helper ────────────────────────────────────────────────────────────

async function callGeminiStructured(
  prompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 8192,
        responseMimeType: "application/json",
      },
    });

    const result = response.response.text();
    if (!result) throw new Error('Empty response from Gemini');
    return JSON.parse(result);
  } catch (error: any) {
    console.error('[Research] Gemini error:', error.message);
    throw error;
  }
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export async function createResearchWorkspace(
  userId: string,
  projectName: string,
  problemStatement: string
): Promise<string> {
  try {
    // Create workspace
    const workspace = await prisma.researchWorkspace.create({
      data: {
        userId,
        projectName,
        problemStatement,
        status: 'RESEARCHING',
        progress: 0,
        totalStages: 1, // Simplified
        currentStage: 'Generating Comprehensive Research...',
      },
    });

    console.log(`[Research] 🚀 Starting single-step pipeline for workspace: ${workspace.id}`);

    // Fire-and-forget background job
    runPipeline(workspace.id, userId, projectName, problemStatement);

    return workspace.id;
  } catch (error: any) {
    console.error('[Research] Error creating workspace:', error.message);
    throw error;
  }
}

async function runPipeline(
  workspaceId: string,
  userId: string,
  projectName: string,
  problemStatement: string
): Promise<void> {
  try {
    const prompt = `You are a Principal AI Architect and Senior Engineer.
Generate a comprehensive research, architecture, and recommendation package for the following software project:

Project Title: ${projectName}
Problem Statement: ${problemStatement}

Return a valid JSON object strictly matching this schema:
{
  "researchSummary": "string (Markdown format with Executive Summary, Problem Analysis, Solution Overview, Key Features, Technology Considerations, Implementation Challenges, Success Criteria)",
  "githubRepositories": [
    {
      "repoName": "string",
      "description": "string",
      "url": "string (real github url)",
      "stars": number,
      "language": "string",
      "owner": "string"
    }
  ],
  "researchPapers": [
    {
      "title": "string",
      "authors": "string",
      "year": number,
      "summary": "string",
      "url": "string (url if applicable, else null)"
    }
  ],
  "datasets": [
    {
      "title": "string",
      "description": "string",
      "url": "string (direct public link)",
      "source": "string (e.g. Kaggle, UCI, HuggingFace)",
      "rows": number,
      "columns": number,
      "license": "string"
    }
  ],
  "architecture": "string (Mermaid flowchart syntax, e.g. 'graph TB\\n A-->B')",
  "erDiagram": "string (Mermaid erDiagram syntax)",
  "flowDiagram": "string (Mermaid flowchart syntax for main workflow)",
  "documentation": "string (Markdown formatting: Functional Reqs, Non-Functional Reqs, Tech Stack, Security, API Design, Deployment)",
  "srs": "string (Markdown formatting: IEEE Software Requirements Specification structure)"
}

Requirements:
- Provide 8-10 real GitHub repositories.
- Provide 8 real research papers.
- Provide 8 real datasets.
- Ensure all Mermaid diagrams are just the code, no markdown wrappers like \`\`\`mermaid.
- Ensure all markdown fields use valid markdown formatting.
- DO NOT hallucinate URLs if possible, but recommend relevant real-world equivalents.
- Provide highly detailed technical content for the documentation and SRS.`;

    // Fetch from Gemini
    console.log(`[Research] Calling Gemini for workspace: ${workspaceId}`);
    const data = await callGeminiStructured(prompt, { temperature: 0.5, maxTokens: 8192 });

    console.log(`[Research] Gemini returned data successfully. Saving to DB...`);

    // Bulk insert items (Repos, Papers, Datasets)
    const itemsToCreate: any[] = [];

    if (Array.isArray(data.githubRepositories)) {
      data.githubRepositories.forEach((repo: any) => {
        itemsToCreate.push({
          workspaceId,
          type: 'GITHUB',
          title: repo.repoName || 'Untitled',
          repoName: repo.repoName || null,
          url: repo.url || null,
          stars: repo.stars || null,
          language: repo.language || null,
          owner: repo.owner || null,
          description: repo.description || null,
        });
      });
    }

    if (Array.isArray(data.researchPapers)) {
      data.researchPapers.forEach((paper: any) => {
        itemsToCreate.push({
          workspaceId,
          type: 'PAPER',
          title: paper.title || 'Untitled',
          authors: paper.authors || null,
          publishedYear: paper.year || null,
          summary: paper.summary || null,
          url: paper.url || null,
          description: paper.summary || null,
        });
      });
    }

    if (Array.isArray(data.datasets)) {
      data.datasets.forEach((dataset: any) => {
        itemsToCreate.push({
          workspaceId,
          type: 'DATASET',
          title: dataset.title || 'Untitled',
          url: dataset.url || null,
          rows: dataset.rows || null,
          columns: dataset.columns || null,
          downloadSource: dataset.source || null,
          license: dataset.license || null,
          datasource: dataset.source || null,
          description: dataset.description || null,
        });
      });
    }

    if (itemsToCreate.length > 0) {
      await prisma.researchWorkspaceItem.createMany({
        data: itemsToCreate,
      });
    }

    // Update the workspace with all the text/diagram content
    await prisma.researchWorkspace.update({
      where: { id: workspaceId },
      data: {
        research: data.researchSummary || null,
        architecture: data.architecture || null,
        erDiagram: data.erDiagram || null,
        flowDiagram: data.flowDiagram || null,
        documentation: data.documentation || null,
        srsDocument: data.srs || null,
        status: 'COMPLETED',
        progress: 100,
        currentStage: 'Completed',
        completedAt: new Date(),
      },
    });

    console.log(`[Research] ✅ Pipeline completed and saved for workspace: ${workspaceId}`);
    
    // Broadcast completion
    io.to(userId).emit('research_workspace_update', {
      workspaceId,
      stage: 'Completed',
      progress: 100,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error(`[Research] ❌ Pipeline error for workspace ${workspaceId}:`, error.message);
    await prisma.researchWorkspace.update({
      where: { id: workspaceId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    });
    io.to(userId).emit('research_workspace_error', {
      workspaceId,
      error: error.message,
    });
  }
}

// ─── Fetch Functions ──────────────────────────────────────────────────────────

export async function getResearchWorkspace(workspaceId: string) {
  return prisma.researchWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      items: true,
    },
  });
}

export async function listUserWorkspaces(userId: string, limit: number = 20) {
  return prisma.researchWorkspace.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

