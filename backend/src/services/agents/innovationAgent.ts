import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';
import { ResearchAgentResult } from './researchAgent';

export interface InnovationAgentInput {
  workflowId: string;
  agentId: string;
  researchData: ResearchAgentResult;
}

export interface FeaturePrioritization {
  mustHave: string[];
  shouldHave: string[];
  niceToHave: string[];
  futureVersion: string[];
}

export interface Roadmap {
  phase1: string[];
  phase2: string[];
  phase3: string[];
  futureExpansion: string[];
}

export interface Scoring {
  innovation: number;
  technicalFeasibility: number;
  businessValue: number;
  scalability: number;
  marketDemand: number;
  aiImpact: number;
  overallProductScore: number;
}

export interface InnovationAgentResult {
  executiveInnovationSummary: string;
  uniqueSellingProposition: string;
  innovationScore: number;
  aiFeatureSuggestions: string[];
  automationOpportunities: string[];
  futureReadyFeatures: string[];
  premiumFeatures: string[];
  mvpFeatures: string[];
  phase2Features: string[];
  enterpriseFeatures: string[];
  competitiveAdvantages: string[];
  userExperienceImprovements: string[];
  accessibilitySuggestions: string[];
  scalabilityRecommendations: string[];
  securityImprovements: string[];
  performanceOptimizations: string[];
  cloudRecommendations: string[];
  businessModelSuggestions: string[];
  pricingStrategy: string;
  monetizationOpportunities: string[];
  marketOpportunities: string[];
  goToMarketSuggestions: string[];
  futureScope: string;
  riskReductionStrategies: string[];
  implementationPriority: string[];
  featurePrioritization: FeaturePrioritization;
  roadmap: Roadmap;
  scoring: Scoring;
}

import { BaseAgent } from './baseAgent';

export class InnovationAgent extends BaseAgent {
  constructor() {
    super();
  }

  public validate(input: any): boolean {
    return !!(input && input.researchData);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('InnovationAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  public async execute(input: InnovationAgentInput): Promise<InnovationAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Innovation Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Initializing Innovation Agent...');
    
    // We strictly use the research report, NO external MCP calls
    const inputPayload = JSON.stringify(input.researchData, null, 2);
    const inputSize = inputPayload.length;
    
    this.updateState('running', 30, 'Analyzing research report...');
    this.emitProgress(input.workflowId, input.agentId, 'Analyzing research report...');

    const systemPrompt = `You are a Senior AI Product Strategist, Startup Mentor, and AI Product Designer. 
Your task is to analyze the provided structured Research Report and generate highly innovative product improvements, monetization strategies, and implementation recommendations. 
You must output a highly detailed, strictly formatted JSON object. Do not include markdown wrappers, just valid JSON.

Output MUST strictly match this JSON schema:
{
  "executiveInnovationSummary": "string",
  "uniqueSellingProposition": "string",
  "innovationScore": 0,
  "aiFeatureSuggestions": ["string"],
  "automationOpportunities": ["string"],
  "futureReadyFeatures": ["string"],
  "premiumFeatures": ["string"],
  "mvpFeatures": ["string"],
  "phase2Features": ["string"],
  "enterpriseFeatures": ["string"],
  "competitiveAdvantages": ["string"],
  "userExperienceImprovements": ["string"],
  "accessibilitySuggestions": ["string"],
  "scalabilityRecommendations": ["string"],
  "securityImprovements": ["string"],
  "performanceOptimizations": ["string"],
  "cloudRecommendations": ["string"],
  "businessModelSuggestions": ["string"],
  "pricingStrategy": "string",
  "monetizationOpportunities": ["string"],
  "marketOpportunities": ["string"],
  "goToMarketSuggestions": ["string"],
  "futureScope": "string",
  "riskReductionStrategies": ["string"],
  "implementationPriority": ["string"],
  "featurePrioritization": {
    "mustHave": ["string"],
    "shouldHave": ["string"],
    "niceToHave": ["string"],
    "futureVersion": ["string"]
  },
  "roadmap": {
    "phase1": ["string"],
    "phase2": ["string"],
    "phase3": ["string"],
    "futureExpansion": ["string"]
  },
  "scoring": {
    "innovation": 0,
    "technicalFeasibility": 0,
    "businessValue": 0,
    "scalability": 0,
    "marketDemand": 0,
    "aiImpact": 0,
    "overallProductScore": 0
  }
}`;

    const userPrompt = `Analyze the following Research Report and generate the innovation strategy:\n\n${inputPayload}`;

    this.updateState('running', 60, 'Generating innovation strategy...');
    this.emitProgress(input.workflowId, input.agentId, 'Generating innovation strategy...');

    const response = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.7, jsonMode: true });

    const executionTimeMs = Date.now() - startTime;
    this.updateState('running', 90, 'Parsing report');
    const content = response.text || '{}';
    const outputSize = content.length;

    mcpLogger.info('InnovationAgent', `Execution completed in ${executionTimeMs}ms. Input size: ${inputSize} chars. Output size: ${outputSize} chars.`);
    
    
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

    
    try { this.resultData = JSON.parse(jsonString) as InnovationAgentResult;
      this.updateState('completed', 100, 'Innovation completed');
      return this.resultData;
    } catch (error) {
      mcpLogger.error('InnovationAgent', 'Failed to parse LLM JSON output', error);
      this.updateState('failed', 100, 'Failed to generate structured JSON innovation report');
      throw new Error('Failed to generate structured JSON innovation report');
    }
  }
}
