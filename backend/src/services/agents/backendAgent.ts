import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';
import fs from 'fs';
import path from 'path';
import { ResearchAgentResult } from './researchAgent';
import { InnovationAgentResult } from './innovationAgent';
import { ArchitectureAgentResult } from './architectureAgent';

export interface BackendAgentInput {
  workflowId: string;
  agentId: string;
  projectIdea: string;
  researchData: ResearchAgentResult;
  innovationData: InnovationAgentResult;
  architectureData: ArchitectureAgentResult;
}

export interface BackendAgentResult {
  backendAnalysis: string;
  generatedAPIs: { endpoint: string; method: string; description: string; reqBody: string; resBody: string }[];
  generatedControllers: { name: string; code: string; description: string }[];
  generatedServices: { name: string; code: string; description: string }[];
  generatedMiddleware: { name: string; code: string; description: string }[];
  generatedPrismaModels: { modelName: string; schema: string; description: string }[];
  databaseTables: string[];
  routesCreated: string[];
  filesCreated: string[];
  filesModified: string[];
  securityFeatures: string[];
  pendingFrontendTasks: string[];
}

import { BaseAgent } from './baseAgent';

export class BackendAgent extends BaseAgent {
  constructor() {
    super();
  }

  public validate(input: any): boolean {
    return !!(input && input.architectureData);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('BackendAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  private getExistingBackendStructure(): string {
    let structure = '';
    const srcPath = path.join(__dirname, '../../../src');
    const prismaPath = path.join(__dirname, '../../../../prisma/schema.prisma');
    const envPath = path.join(__dirname, '../../../../.env');
    
    try {
      const getTree = (dir: string, depth = 0): string => {
        if (depth > 4) return '';
        let tree = '';
        if (!fs.existsSync(dir)) return tree;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          tree += '  '.repeat(depth) + '- ' + file + '\n';
          if (stat.isDirectory()) {
            tree += getTree(fullPath, depth + 1);
          } else if (['server.ts', 'app.ts', 'index.ts', 'routes.ts'].includes(file) || file.endsWith('routes.ts') || file.endsWith('controller.ts')) {
             // Read contents of critical structural files
             try {
                const content = fs.readFileSync(fullPath, 'utf8');
                // Only include first 100 lines to avoid blowing up context size too much
                const shortContent = content.split('\\n').slice(0, 100).join('\\n');
                tree += '  '.repeat(depth + 1) + '--- FILE CONTENT START ---\n' + shortContent + '\n' + '  '.repeat(depth + 1) + '--- FILE CONTENT END ---\n';
             } catch(e) {}
          }
        }
        return tree;
      };
      
      structure += '--- EXISTING BACKEND STRUCTURE & ROUTES ---\n';
      structure += getTree(srcPath);
      
      if (fs.existsSync(prismaPath)) {
         structure += '\n--- EXISTING PRISMA SCHEMA ---\n';
         structure += fs.readFileSync(prismaPath, 'utf8');
      }

      if (fs.existsSync(envPath)) {
         structure += '\n--- EXISTING ENVIRONMENT VARIABLES (KEYS ONLY) ---\n';
         const envContent = fs.readFileSync(envPath, 'utf8');
         const keys = envContent.split('\\n').filter(l => l.includes('=')).map(l => l.split('=')[0]).join(', ');
         structure += keys;
      }
    } catch (error) {
      console.error('Error reading backend structure', error);
      structure += 'Error reading structure.\n';
    }
    
    return structure;
  }

  public async execute(input: BackendAgentInput): Promise<BackendAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Backend Generation Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Initializing Backend Generation Agent...');
    
    this.updateState('running', 20, 'Analyzing Existing Backend Codebase...');
    this.emitProgress(input.workflowId, input.agentId, 'Analyzing Existing Backend Codebase...');
    const existingBackendStr = this.getExistingBackendStructure();

    const inputPayload = JSON.stringify({
      idea: input.projectIdea,
      research: input.researchData,
      innovation: input.innovationData,
      architecture: input.architectureData,
      existingBackendStructure: existingBackendStr
    }, null, 2);
    
    const systemPrompt = `You are the Lead Backend AI Engineer.
Your task is to automatically generate a production-ready backend implementation plan and code modules based on the approved architecture.
You must NOT overwrite existing logic or models, but rather extend them. Reuse existing code whenever possible.
Generate code module-by-module.
Include REST APIs, Controllers, Services, Repositories, Validation, Business Logic, Middleware, DTOs, Security, Background Tasks.

Output MUST strictly match this JSON schema. Do NOT write any markdown outside the JSON.

{
  "backendAnalysis": "string (Detailed analysis of what currently exists and what needs to be added)",
  "generatedAPIs": [
    { "endpoint": "string", "method": "string", "description": "string", "reqBody": "string", "resBody": "string" }
  ],
  "generatedControllers": [
    { "name": "string", "code": "string (the actual code)", "description": "string" }
  ],
  "generatedServices": [
    { "name": "string", "code": "string (the actual code)", "description": "string" }
  ],
  "generatedMiddleware": [
    { "name": "string", "code": "string (the actual code)", "description": "string" }
  ],
  "generatedPrismaModels": [
    { "modelName": "string", "schema": "string (the prisma code block)", "description": "string" }
  ],
  "databaseTables": ["string"],
  "routesCreated": ["string"],
  "filesCreated": ["string (e.g. src/controllers/userController.ts)"],
  "filesModified": ["string"],
  "securityFeatures": ["string"],
  "pendingFrontendTasks": ["string"]
}

Rules:
1. "generatedControllers", "generatedServices", and "generatedMiddleware" MUST contain the raw TypeScript code.
2. "generatedPrismaModels" MUST contain valid Prisma schema syntax.
3. Keep the code strictly modular.
4. ONLY generate what is missing based on the "existingBackendStructure". Do NOT break existing schemas.
5. Implement Security: JWT, RBAC, Helmet, CORS, Rate Limiting, Input Validation.
6. Support Background Tasks in Modular Services: Research Queue, Architecture Queue, Notification Queue.
`;

    const userPrompt = `Generate the backend modules based on this context:\n\n${inputPayload}`;

    this.updateState('running', 30, 'Generating Prisma...');
    this.emitProgress(input.workflowId, input.agentId, 'Generating Prisma...');
    
    // Simulating progress steps for better UX
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating APIs...'), 4000);
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating Controllers...'), 8000);
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating Services...'), 12000);
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating Middleware...'), 16000);

    const response = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.3, jsonMode: true });

    const executionTimeMs = Date.now() - startTime;
    this.updateState('running', 90, 'Parsing backend report');
    const content = response.text || '{}';

    mcpLogger.info('BackendAgent', `Execution completed in ${executionTimeMs}ms.`);
    this.updateState('running', 95, 'Backend Generation Complete.');
    this.emitProgress(input.workflowId, input.agentId, 'Backend Generation Complete.');
    
    
    // Robust JSON Extraction
    let jsonString = content;
    const jsonMatch = content.match(/\u0060\u0060\u0060(?:json)?\s*([\s\S]*?)\s*\u0060\u0060\u0060/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    } else {
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = content.substring(firstBrace, lastBrace + 1);
      }
    }

    
    try { this.resultData = JSON.parse(jsonString) as BackendAgentResult;
      this.updateState('completed', 100, 'Backend generation completed');
      return this.resultData;
    } catch (error) {
      mcpLogger.error('BackendAgent', 'Failed to parse LLM JSON output', error);
      this.updateState('failed', 100, 'Failed to generate structured backend JSON');
      throw new Error('Failed to generate structured backend JSON');
    }
  }
}
