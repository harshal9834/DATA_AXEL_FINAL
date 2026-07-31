"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const mcp_1 = require("../mcp");
const logger_1 = require("../../utils/logger");
const server_1 = require("../../server");
const baseAgent_1 = require("./baseAgent");
class ResearchAgent extends baseAgent_1.BaseAgent {
    constructor() {
        super();
    }
    validate(input) {
        return !!(input && input.projectTitle && input.problemStatement);
    }
    emitProgress(workflowId, agentId, message) {
        logger_1.mcpLogger.info('ResearchAgent', message);
        server_1.io.emit('ai_thinking', { workflowId, agentId, thought: message });
    }
    async execute(input) {
        const startTime = Date.now();
        this.updateState('running', 10, 'Initializing Research Agent...');
        this.emitProgress(input.workflowId, input.agentId, 'Initializing Research Agent...');
        const searchQuery = `${input.projectTitle} ${input.problemStatement} ${input.technologyPreference || ''}`.trim();
        this.emitProgress(input.workflowId, input.agentId, 'Querying MCP services in parallel...');
        // Execute all MCP services concurrently
        const [githubResult, context7Result, tavilyResult, serperResult] = await Promise.allSettled([
            mcp_1.mcpServices.github.searchRepository(searchQuery),
            mcp_1.mcpServices.context7.fetchDocumentation(searchQuery),
            mcp_1.mcpServices.tavily.search(searchQuery),
            mcp_1.mcpServices.serper.search(searchQuery)
        ]);
        // NOTE: Firecrawl takes a URL, not a query, so we skip it or use it differently. For now we use the other 4.
        const allResults = [];
        const serviceStats = {
            success: 0,
            failed: 0,
            errors: []
        };
        const processResult = (result, name) => {
            if (result.status === 'fulfilled') {
                allResults.push(...result.value);
                serviceStats.success++;
            }
            else {
                serviceStats.failed++;
                serviceStats.errors.push(`${name} failed: ${result.reason.message}`);
                logger_1.mcpLogger.warn('ResearchAgent', `Service ${name} failed, but continuing...`, result.reason);
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
        const response = await (0, AIProvider_1.generateResponse)([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], { temperature: 0.5, jsonMode: true });
        const executionTimeMs = Date.now() - startTime;
        logger_1.mcpLogger.info('ResearchAgent', `Research completed in ${executionTimeMs}ms. Services: ${serviceStats.success} succeeded, ${serviceStats.failed} failed.`);
        try {
            this.updateState('running', 90, 'Parsing report');
            const content = response.text || '{}';
            this.resultData = JSON.parse(content);
            this.updateState('completed', 100, 'Research completed');
            return this.resultData;
        }
        catch (error) {
            logger_1.mcpLogger.error('ResearchAgent', 'Failed to parse LLM JSON output', error);
            this.updateState('failed', 100, 'Failed to generate structured JSON report');
            throw new Error('Failed to generate structured JSON report');
        }
    }
    deduplicateResults(results) {
        const seenUrls = new Set();
        return results.filter(result => {
            if (!result.url)
                return true; // keep if no url
            if (seenUrls.has(result.url)) {
                return false;
            }
            seenUrls.add(result.url);
            return true;
        });
    }
}
exports.ResearchAgent = ResearchAgent;
//# sourceMappingURL=researchAgent.js.map