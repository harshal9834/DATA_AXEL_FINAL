"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const logger_1 = require("../../utils/logger");
const server_1 = require("../../server");
const baseAgent_1 = require("./baseAgent");
class ArchitectureAgent extends baseAgent_1.BaseAgent {
    constructor() {
        super();
    }
    validate(input) {
        return !!(input && input.researchData && input.innovationData);
    }
    emitProgress(workflowId, agentId, message) {
        logger_1.mcpLogger.info('ArchitectureAgent', message);
        server_1.io.emit('ai_thinking', { workflowId, agentId, thought: message });
    }
    async execute(input) {
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
        const response = await (0, AIProvider_1.generateResponse)([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], { temperature: 0.2, jsonMode: true });
        const executionTimeMs = Date.now() - startTime;
        this.updateState('running', 90, 'Parsing architecture report');
        const content = response.text || '{}';
        const outputSize = content.length;
        logger_1.mcpLogger.info('ArchitectureAgent', `Execution completed in ${executionTimeMs}ms. Input size: ${inputSize} chars. Output size: ${outputSize} chars.`);
        // Robust JSON Extraction
        let jsonString = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        }
        else {
            // Fallback: Try to find the first { and last }
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonString = content.substring(firstBrace, lastBrace + 1);
            }
        }
        try {
            this.resultData = JSON.parse(jsonString);
            this.updateState('completed', 100, 'Architecture completed');
            return this.resultData;
        }
        catch (error) {
            logger_1.mcpLogger.error('ArchitectureAgent', 'Failed to parse LLM JSON output. Attempting cleanup...', error);
            // Try replacing common JSON errors if possible, or fallback
            try {
                // Very basic cleanup for trailing commas
                const cleanedJson = jsonString.replace(/,\s*([}\]])/g, '$1');
                this.resultData = JSON.parse(cleanedJson);
                this.updateState('completed', 100, 'Architecture completed after cleanup');
                return this.resultData;
            }
            catch (cleanupError) {
                logger_1.mcpLogger.error('ArchitectureAgent', 'Complete failure to parse JSON.', cleanupError);
                this.updateState('failed', 100, 'Failed to generate structured JSON architecture report');
                throw new Error('Failed to generate structured JSON architecture report');
            }
        }
    }
}
exports.ArchitectureAgent = ArchitectureAgent;
//# sourceMappingURL=architectureAgent.js.map