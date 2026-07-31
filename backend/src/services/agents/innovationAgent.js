"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnovationAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const logger_1 = require("../../utils/logger");
const server_1 = require("../../server");
const baseAgent_1 = require("./baseAgent");
class InnovationAgent extends baseAgent_1.BaseAgent {
    constructor() {
        super();
    }
    validate(input) {
        return !!(input && input.researchData);
    }
    emitProgress(workflowId, agentId, message) {
        logger_1.mcpLogger.info('InnovationAgent', message);
        server_1.io.emit('ai_thinking', { workflowId, agentId, thought: message });
    }
    async execute(input) {
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
        const response = await (0, AIProvider_1.generateResponse)([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], { temperature: 0.7, jsonMode: true });
        const executionTimeMs = Date.now() - startTime;
        this.updateState('running', 90, 'Parsing report');
        const content = response.text || '{}';
        const outputSize = content.length;
        logger_1.mcpLogger.info('InnovationAgent', `Execution completed in ${executionTimeMs}ms. Input size: ${inputSize} chars. Output size: ${outputSize} chars.`);
        // Robust JSON Extraction
        let jsonString = content;
        const jsonMatch = content.match(/\u0060\u0060\u0060(?:json)?\s*([\s\S]*?)\s*\u0060\u0060\u0060/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        }
        else {
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonString = content.substring(firstBrace, lastBrace + 1);
            }
        }
        try {
            this.resultData = JSON.parse(jsonString);
            this.updateState('completed', 100, 'Innovation completed');
            return this.resultData;
        }
        catch (error) {
            logger_1.mcpLogger.error('InnovationAgent', 'Failed to parse LLM JSON output', error);
            this.updateState('failed', 100, 'Failed to generate structured JSON innovation report');
            throw new Error('Failed to generate structured JSON innovation report');
        }
    }
}
exports.InnovationAgent = InnovationAgent;
//# sourceMappingURL=innovationAgent.js.map