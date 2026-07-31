import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';
import { BaseAgent } from './baseAgent';
import { BackendAgentResult } from './backendAgent';
import { FrontendAgentResult } from './frontendAgent';
import { DocumentationAgentResult } from './documentationAgent';

export interface AnalysisAgentInput {
  workflowId: string;
  agentId: string;
  projectIdea: string;
  backendData: BackendAgentResult;
  frontendData: FrontendAgentResult;
  documentationData: DocumentationAgentResult;
}

export interface Issue {
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  rootCause: string;
  recommendedFix: string;
  filesAffected: string[];
}

export interface AnalysisAgentResult {
  executiveSummary: string;
  issuesFound: Issue[];
  qualityScores: {
    architecture: number;
    backend: number;
    frontend: number;
    voiceAssistant: number;
    workflow: number;
    aiAgents: number;
    documentation: number;
    security: number;
    performance: number;
    maintainability: number;
    scalability: number;
  };
  productionReadinessChecklist: string[];
  finalReadinessPercentage: number;
}

export class AnalysisAgent extends BaseAgent {
  constructor() {
    super();
  }

  public validate(input: any): boolean {
    return !!(input && input.backendData && input.frontendData && input.documentationData);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('AnalysisAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  public async execute(input: AnalysisAgentInput): Promise<AnalysisAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Analysis Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Initializing Analysis Agent...');
    
    this.updateState('running', 20, 'Analyzing Code Quality...');
    this.emitProgress(input.workflowId, input.agentId, 'Analyzing Code Quality...');

    const inputPayload = JSON.stringify({
      idea: input.projectIdea,
      backendModules: input.backendData,
      frontendModules: input.frontendData,
      documentation: input.documentationData
    });
    
    const systemPrompt = `You are the Lead AI Quality Assurance & Systems Architect.
Your task is to perform a complete audit of the generated project and produce a quality report with actionable improvements.
Analyze Code Quality, Security, Performance, Voice Assistant integration, Workflow Validation, MCP Validation, Error Handling, and Observability.

Output MUST strictly match this JSON schema. Do NOT write any markdown outside the JSON.

{
  "executiveSummary": "string",
  "issuesFound": [
    {
      "title": "string",
      "severity": "Critical | High | Medium | Low",
      "rootCause": "string",
      "recommendedFix": "string",
      "filesAffected": ["string"]
    }
  ],
  "qualityScores": {
    "architecture": 0,
    "backend": 0,
    "frontend": 0,
    "voiceAssistant": 0,
    "workflow": 0,
    "aiAgents": 0,
    "documentation": 0,
    "security": 0,
    "performance": 0,
    "maintainability": 0,
    "scalability": 0
  },
  "productionReadinessChecklist": ["string"],
  "finalReadinessPercentage": 0
}

Rules:
1. Provide deep, critical analysis. Do not just say everything is perfect. Find at least 5 realistic issues based on common generative AI mistakes.
2. Validate Security (Secrets handling, Prisma queries, JWT, CORS, Rate Limiting).
3. Validate Voice Assistant state machine logic (Idle -> Listening -> Thinking -> Speaking -> Listening).
4. Validate Workflow execution order.
5. Provide actionable Recommended Fixes.
6. The scores should be numbers from 0 to 100.
`;

    const userPrompt = `Generate the analysis based on this context:\n\n${inputPayload.substring(0, 15000)}`; // Truncated to avoid massive token limits if necessary

    this.updateState('running', 40, 'Running Security Audit...');
    this.emitProgress(input.workflowId, input.agentId, 'Running Security Audit...');
    
    // Simulating progress steps for better UX
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Analyzing Performance...'), 4000);
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Validating Voice Assistant & Workflow...'), 8000);
    setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Calculating Quality Scores...'), 12000);

    const response = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.2, jsonMode: true });

    const executionTimeMs = Date.now() - startTime;
    this.updateState('running', 90, 'Parsing analysis report');
    const content = response.text || '{}';

    mcpLogger.info('AnalysisAgent', `Execution completed in ${executionTimeMs}ms.`);
    this.updateState('running', 95, 'Analysis Generation Complete.');
    this.emitProgress(input.workflowId, input.agentId, 'Analysis Generation Complete.');
    
    
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

    
    try { this.resultData = JSON.parse(jsonString) as AnalysisAgentResult;
      this.updateState('completed', 100, 'Analysis generation completed');
      return this.resultData;
    } catch (error) {
      mcpLogger.error('AnalysisAgent', 'Failed to parse LLM JSON output', error);
      this.updateState('failed', 100, 'Failed to generate structured analysis JSON');
      throw new Error('Failed to generate structured analysis JSON');
    }
  }
}
