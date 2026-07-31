import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';
import fs from 'fs';
import path from 'path';
import { BaseAgent } from './baseAgent';
import { BackendAgentResult } from './backendAgent';

export interface FrontendAgentInput {
  workflowId: string;
  agentId: string;
  projectIdea: string;
  backendData: BackendAgentResult;
}

export interface FrontendAgentResult {
  pagesCreated: { name: string; code: string; description: string; route: string }[];
  componentsCreated: { name: string; code: string; description: string }[];
  formsGenerated: { name: string; code: string; description: string }[];
  hooksCreated: { name: string; code: string; description: string }[];
  apisConnected: string[];
  filesModified: string[];
  responsiveSupport: string;
  pendingDocumentationTasks: string[];
}

export class FrontendAgent extends BaseAgent {
  constructor() {
    super();
  }

  public validate(input: any): boolean {
    return !!(input && input.backendData);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('FrontendAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  private getExistingFrontendStructure(): string {
    let structure = '';
    const srcPath = path.join(__dirname, '../../../../frontend/src');
    
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
          } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            // Read contents of essential structural files
            if (depth <= 2 && (file.includes('route') || file.includes('app') || file.includes('index'))) {
               try {
                  const content = fs.readFileSync(fullPath, 'utf8');
                  const shortContent = content.split('\\n').slice(0, 100).join('\\n');
                  tree += '  '.repeat(depth + 1) + '--- FILE CONTENT START ---\n' + shortContent + '\n' + '  '.repeat(depth + 1) + '--- FILE CONTENT END ---\n';
               } catch(e) {}
            }
          }
        }
        return tree;
      };
      
      structure += '--- EXISTING FRONTEND STRUCTURE & ROUTES ---\n';
      structure += getTree(srcPath);
      
    } catch (error) {
      console.error('Error reading frontend structure', error);
      structure += 'Error reading structure.\n';
    }
    
    return structure;
  }

  public async execute(input: FrontendAgentInput): Promise<FrontendAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Frontend Generation Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Initializing Frontend Generation Agent...');
    
    this.updateState('running', 20, 'Analyzing Existing Frontend...');
    this.emitProgress(input.workflowId, input.agentId, 'Analyzing Existing Frontend...');
    const existingFrontendStr = this.getExistingFrontendStructure();

    const inputPayload = JSON.stringify({
      idea: input.projectIdea,
      backendModules: input.backendData,
      existingFrontendStructure: existingFrontendStr
    }, null, 2);
    
    const systemPrompt = `You are the Lead Frontend AI Engineer.
Your task is to automatically generate the required frontend implementation based on the completed backend architecture.
You must NOT overwrite working UI. You must NOT create a new React project.
Reuse all existing components, layouts, routing, design system, and state management.
Maintain the current design language (Tailwind). Ensure Desktop, Tablet, and Mobile responsiveness.

Output MUST strictly match this JSON schema. Do NOT write any markdown outside the JSON.

{
  "pagesCreated": [
    { "name": "string", "code": "string (raw code)", "description": "string", "route": "string" }
  ],
  "componentsCreated": [
    { "name": "string", "code": "string (raw code)", "description": "string" }
  ],
  "formsGenerated": [
    { "name": "string", "code": "string (raw code)", "description": "string" }
  ],
  "hooksCreated": [
    { "name": "string", "code": "string (raw code)", "description": "string" }
  ],
  "apisConnected": ["string"],
  "filesModified": ["string"],
  "responsiveSupport": "string (description of responsive implementation)",
  "pendingDocumentationTasks": ["string"]
}

Rules:
1. "code" fields MUST contain raw TypeScript/React (tsx) code.
2. ONLY generate what is missing.
3. Connect every generated page with the Backend APIs.
4. Integrate existing authentication.
5. Reuse components like Cards, Buttons, Timeline, Workflow, Status Chips.
6. Generate Loading, Error, Success, and Empty States for new features.
`;

    const userPrompt = `Generate the frontend modules based on this context:\n\n${inputPayload}`;

    this.updateState('running', 40, 'Generating Components...');
    this.emitProgress(input.workflowId, input.agentId, 'Generating Components...');
    
    // Simulating progress steps for better UX
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Connecting APIs...'), 4000);
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating Forms...'), 8000);

    const response = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.3, jsonMode: true });

    const executionTimeMs = Date.now() - startTime;
    this.updateState('running', 90, 'Parsing frontend report');
    const content = response.text || '{}';

    mcpLogger.info('FrontendAgent', `Execution completed in ${executionTimeMs}ms.`);
    this.updateState('running', 95, 'Frontend Generation Complete.');
    this.emitProgress(input.workflowId, input.agentId, 'Frontend Generation Complete.');
    
    
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

    
    try { this.resultData = JSON.parse(jsonString) as FrontendAgentResult;
      this.updateState('completed', 100, 'Frontend generation completed');
      return this.resultData;
    } catch (error) {
      mcpLogger.error('FrontendAgent', 'Failed to parse LLM JSON output', error);
      this.updateState('failed', 100, 'Failed to generate structured frontend JSON');
      throw new Error('Failed to generate structured frontend JSON');
    }
  }
}
