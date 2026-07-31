import { generateResponse } from '../../config/AIProvider';
import { mcpServices } from '../mcp';
import { UnifiedResponse } from '../../types/mcp';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';

export interface ResearchAgentInput {
  workflowId: string;
  agentId: string;
  projectTitle: string;
  problemStatement: string;
  description?: string;
  technologyPreference?: string;
}

export interface ResearchAgentResult {
  executiveSummary: string;
  problemUnderstanding: string;
  existingSolutions: string[];
  competitorAnalysis: string;
  similarGithubProjects: string[];
  technologyRecommendations: string[];
  frameworkRecommendations: string[];
  libraries: string[];
  industryTrends: string;
  latestResearch: string;
  challenges: string[];
  opportunities: string[];
  suggestedFeatures: string[];
  risks: string[];
  scalabilityConsiderations: string;
  securityConsiderations: string;
  recommendedTechStack: string;
  researchConclusion: string;
}

import { BaseAgent } from './baseAgent';

export class ResearchAgent extends BaseAgent {
  constructor() {
    super();
  }

  public validate(input: any): boolean {
    return !!(input && input.projectTitle && input.problemStatement);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('ResearchAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  public async execute(input: ResearchAgentInput): Promise<ResearchAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Research Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Initializing Research Agent...');

    const searchQuery = `${input.projectTitle} ${input.problemStatement} ${input.technologyPreference || ''}`.trim();

    this.emitProgress(input.workflowId, input.agentId, 'Querying MCP services in parallel...');
    
    // Execute all MCP services concurrently
    const [githubResult, context7Result, tavilyResult, serperResult] = await Promise.allSettled([
      mcpServices.github.searchRepository(searchQuery),
      mcpServices.context7.fetchDocumentation(searchQuery),
      mcpServices.tavily.search(searchQuery),
      mcpServices.serper.search(searchQuery)
    ]);
    // NOTE: Firecrawl takes a URL, not a query, so we skip it or use it differently. For now we use the other 4.

    const allResults: UnifiedResponse[] = [];
    const serviceStats = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const processResult = (result: PromiseSettledResult<UnifiedResponse[]>, name: string) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
        serviceStats.success++;
      } else {
        serviceStats.failed++;
        serviceStats.errors.push(`${name} failed: ${result.reason.message}`);
        mcpLogger.warn('ResearchAgent', `Service ${name} failed, but continuing...`, result.reason);
      }
    };

    processResult(githubResult, 'GitHub');
    processResult(context7Result, 'Context7');
    processResult(tavilyResult, 'Tavily');
    processResult(serperResult, 'Serper');

    this.emitProgress(input.workflowId, input.agentId, 'Removing duplicates and aggregating data...');
    const uniqueResults = this.deduplicateResults(allResults);

    this.emitProgress(input.workflowId, input.agentId, 'Synthesizing report using LLM...');
    
    const reportContext = uniqueResults.map(r => `Source: ${r.source}\nTitle: ${r.title}\nDescription: ${r.description}\nContent: ${r.content}\nURL: ${r.url}`).join('\n\n');

    const systemPrompt = `You are a Senior AI Research Supervisor. Generate a structured JSON report based on the raw research data provided. DO NOT expose the raw API responses. Synthesize the information.
Output MUST strictly match this JSON schema:
{
  "executiveSummary": "string",
  "problemUnderstanding": "string",
  "existingSolutions": ["string"],
  "competitorAnalysis": "string",
  "similarGithubProjects": ["string"],
  "technologyRecommendations": ["string"],
  "frameworkRecommendations": ["string"],
  "libraries": ["string"],
  "industryTrends": "string",
  "latestResearch": "string",
  "challenges": ["string"],
  "opportunities": ["string"],
  "suggestedFeatures": ["string"],
  "risks": ["string"],
  "scalabilityConsiderations": "string",
  "securityConsiderations": "string",
  "recommendedTechStack": "string",
  "researchConclusion": "string"
}`;

    const userPrompt = `Project Title: ${input.projectTitle}
Problem Statement: ${input.problemStatement}
Description: ${input.description || 'N/A'}
Technology Preference: ${input.technologyPreference || 'N/A'}

Raw Research Data:
${reportContext}`;

    const response = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.5, jsonMode: true });

    const executionTimeMs = Date.now() - startTime;
    mcpLogger.info('ResearchAgent', `Research completed in ${executionTimeMs}ms. Services: ${serviceStats.success} succeeded, ${serviceStats.failed} failed.`);

    try {
      this.updateState('running', 90, 'Parsing report');
      const content = response.text || '{}';
      this.resultData = JSON.parse(content) as ResearchAgentResult;
      this.updateState('completed', 100, 'Research completed');
      return this.resultData;
    } catch (error) {
      mcpLogger.error('ResearchAgent', 'Failed to parse LLM JSON output', error);
      this.updateState('failed', 100, 'Failed to generate structured JSON report');
      throw new Error('Failed to generate structured JSON report');
    }
  }

  private deduplicateResults(results: UnifiedResponse[]): UnifiedResponse[] {
    const seenUrls = new Set<string>();
    return results.filter(result => {
      if (!result.url) return true; // keep if no url
      if (seenUrls.has(result.url)) {
        return false;
      }
      seenUrls.add(result.url);
      return true;
    });
  }
}
