import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';
import { ResearchAgentResult } from './researchAgent';
import { InnovationAgentResult } from './innovationAgent';

export interface ArchitectureAgentInput {
  workflowId: string;
  agentId: string;
  projectIdea: string;
  researchData: ResearchAgentResult;
  innovationData: InnovationAgentResult;
}

export interface DatabaseEntity {
  name: string;
  fields: { name: string; type: string; isPrimaryKey?: boolean; isForeignKey?: boolean; references?: string }[];
  relationships: string[];
  indexes: string[];
}

export interface ApiEndpoint {
  method: string;
  route: string;
  purpose: string;
  authenticationRequired: boolean;
  input: string;
  output: string;
  validation: string;
}

export interface ImplementationModule {
  name: string;
  description: string;
  tasks: string[];
}

export interface ArchitectureAgentResult {
  executiveArchitectureSummary: string;
  recommendedTechnologyStack: {
    frontend: string;
    backend: string;
    database: string;
    authentication: string;
    storage: string;
    deployment: string;
  };
  frontendArchitecture: string;
  backendArchitecture: string;
  databaseArchitecture: string;
  authenticationStrategy: string;
  authorizationStrategy: string;
  folderStructure: string;
  databaseSchema: {
    entities: DatabaseEntity[];
    suggestedDatabase: string;
    futureExpansionTables: string[];
  };
  apiBlueprint: ApiEndpoint[];
  serviceLayerDesign: string;
  repositoryLayerDesign: string;
  validationLayer: string;
  loggingStrategy: string;
  cachingStrategy: string;
  queueStrategy: string;
  fileStorageStrategy: string;
  securityArchitecture: string;
  performanceStrategy: string;
  scalabilityStrategy: string;
  deploymentStrategy: string;
  monitoringStrategy: string;
  cicdRecommendations: string;
  implementationRoadmap: ImplementationModule[];
  textualDiagrams: {
    systemFlow: string;
    dataFlow: string;
  };
}

import { BaseAgent } from './baseAgent';

export class ArchitectureAgent extends BaseAgent {
  constructor() {
    super();
  }

  public validate(input: any): boolean {
    return !!(input && input.researchData && input.innovationData);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('ArchitectureAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  public async execute(input: ArchitectureAgentInput): Promise<ArchitectureAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Architecture Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Initializing Architecture Agent...');
    
    // We strictly use the research and innovation reports, NO external MCP calls
    const inputPayload = JSON.stringify({
      idea: input.projectIdea,
      research: input.researchData,
      innovation: input.innovationData
    }, null, 2);
    
    const inputSize = inputPayload.length;
    
    this.updateState('running', 30, 'Analyzing research and innovation strategies...');
    this.emitProgress(input.workflowId, input.agentId, 'Analyzing research and innovation strategies...');

    const systemPrompt = `You are an expert Senior Software Architect. Your task is to design a complete, highly scalable system architecture based on the provided project idea, research report, and innovation strategy. 
You must output a highly detailed, strictly formatted JSON object representing the entire system design. DO NOT write implementation code. Only architecture.

Output MUST strictly match this JSON schema:
{
  "executiveArchitectureSummary": "string",
  "recommendedTechnologyStack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "authentication": "string",
    "storage": "string",
    "deployment": "string"
  },
  "frontendArchitecture": "string",
  "backendArchitecture": "string",
  "databaseArchitecture": "string",
  "authenticationStrategy": "string",
  "authorizationStrategy": "string",
  "folderStructure": "string (text-based tree)",
  "databaseSchema": {
    "entities": [
      {
        "name": "string",
        "fields": [{ "name": "string", "type": "string", "isPrimaryKey": false, "isForeignKey": false, "references": "string" }],
        "relationships": ["string"],
        "indexes": ["string"]
      }
    ],
    "suggestedDatabase": "string",
    "futureExpansionTables": ["string"]
  },
  "apiBlueprint": [
    {
      "method": "string (e.g. GET, POST)",
      "route": "string",
      "purpose": "string",
      "authenticationRequired": true,
      "input": "string",
      "output": "string",
      "validation": "string"
    }
  ],
  "serviceLayerDesign": "string",
  "repositoryLayerDesign": "string",
  "validationLayer": "string",
  "loggingStrategy": "string",
  "cachingStrategy": "string",
  "queueStrategy": "string",
  "fileStorageStrategy": "string",
  "securityArchitecture": "string",
  "performanceStrategy": "string",
  "scalabilityStrategy": "string",
  "deploymentStrategy": "string",
  "monitoringStrategy": "string",
  "cicdRecommendations": "string",
  "implementationRoadmap": [
    { "name": "string", "description": "string", "tasks": ["string"] }
  ],
  "textualDiagrams": {
    "systemFlow": "string",
    "dataFlow": "string"
  }
}`;

    const userPrompt = `Generate the architecture for this context:\n\n${inputPayload}`;

    this.updateState('running', 60, 'Designing system architecture...');
    this.emitProgress(input.workflowId, input.agentId, 'Designing system architecture...');

    const response = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.2, jsonMode: true });

    const executionTimeMs = Date.now() - startTime;
    this.updateState('running', 90, 'Parsing architecture report');
    const content = response.text || '{}';
    const outputSize = content.length;

    mcpLogger.info('ArchitectureAgent', `Execution completed in ${executionTimeMs}ms. Input size: ${inputSize} chars. Output size: ${outputSize} chars.`);
    
    // Robust JSON Extraction
    let jsonString = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    } else {
      // Fallback: Try to find the first { and last }
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = content.substring(firstBrace, lastBrace + 1);
      }
    }
    
    try {
      this.resultData = JSON.parse(jsonString) as ArchitectureAgentResult;
      this.updateState('completed', 100, 'Architecture completed');
      return this.resultData;
    } catch (error) {
      mcpLogger.error('ArchitectureAgent', 'Failed to parse LLM JSON output. Attempting cleanup...', error);
      // Try replacing common JSON errors if possible, or fallback
      try {
        // Very basic cleanup for trailing commas
        const cleanedJson = jsonString.replace(/,\s*([}\]])/g, '$1');
        this.resultData = JSON.parse(cleanedJson) as ArchitectureAgentResult;
        this.updateState('completed', 100, 'Architecture completed after cleanup');
        return this.resultData;
      } catch (cleanupError) {
        mcpLogger.error('ArchitectureAgent', 'Complete failure to parse JSON.', cleanupError);
        this.updateState('failed', 100, 'Failed to generate structured JSON architecture report');
        throw new Error('Failed to generate structured JSON architecture report');
      }
    }
  }
}
