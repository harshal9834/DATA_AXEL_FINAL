"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const logger_1 = require("../../utils/logger");
const server_1 = require("../../server");
const baseAgent_1 = require("./baseAgent");
class DocumentationAgent extends baseAgent_1.BaseAgent {
    constructor() {
        super();
    }
    validate(input) {
        return !!(input && input.backendData && input.frontendData);
    }
    emitProgress(workflowId, agentId, message) {
        logger_1.mcpLogger.info('DocumentationAgent', message);
        server_1.io.emit('ai_thinking', { workflowId, agentId, thought: message });
    }
    async execute(input) {
        const startTime = Date.now();
        this.updateState('running', 10, 'Initializing Documentation Agent...');
        this.emitProgress(input.workflowId, input.agentId, 'Initializing Documentation Agent...');
        this.updateState('running', 20, 'Analyzing Project Structure...');
        this.emitProgress(input.workflowId, input.agentId, 'Analyzing Project Structure...');
        const inputPayload = JSON.stringify({
            idea: input.projectIdea,
            backendModules: input.backendData,
            frontendModules: input.frontendData
        });
        const systemPrompt = `You are the Lead Documentation Engineer.
Your task is to automatically generate complete, professional project documentation based on the implemented project context.
Generate structured documentation module-by-module.

Output MUST strictly match this JSON schema. Do NOT write any text outside the JSON. All string values should contain markdown text.

{
  "readme": "string (Includes: README, Installation Guide, Quick Start Guide, Architecture Documentation, Environment Setup, Folder Structure, Troubleshooting, FAQ, Developer Guide, User Guide, Admin Guide)",
  "apiDocumentation": "string (Includes: Endpoint, Method, Authentication, Request Body, Response, Error Codes, Example Request, Example Response)",
  "databaseDocumentation": "string (Includes: Prisma Models, Relationships, Indexes, Enums, Migration Flow)",
  "workflowDocumentation": "string (Research -> Innovation -> Architecture -> Approval -> Backend -> Frontend -> Documentation -> Analysis)",
  "aiAgentDocumentation": "string (Includes: Research Agent, Innovation Agent, Architecture Agent, Backend Agent, Frontend Agent, Documentation Agent, Analysis Agent. Include Purpose, Input, Output, Execution Flow, Dependencies, Speech Recognition, Speech Synthesis, Conversation Manager, Voice State Machine. Also MCP Documentation: GitHub, Context7, Firecrawl, Tavily, Serper with Purpose, Configuration, Execution Order, Fallback)",
  "deploymentGuide": "string",
  "documentsGenerated": ["string (list of documents generated)"],
  "readmeSections": ["string (list of sections in the readme)"],
  "pendingAnalysisTasks": ["string"]
}

Rules:
1. Do not create one massive document; separate it into the exact fields defined.
2. Ensure you document EVERY AI Agent and MCP exactly as requested.
3. Ensure you document Voice capabilities.
4. Output valid JSON. Escape markdown correctly.
`;
        const userPrompt = `Generate the documentation based on this context:\n\n${inputPayload.substring(0, 15000)}`; // Truncated to avoid massive token limits if necessary
        this.updateState('running', 40, 'Generating API Documentation...');
        this.emitProgress(input.workflowId, input.agentId, 'Generating API Documentation...');
        // Simulating progress steps for better UX
        setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating Database Documentation...'), 4000);
        setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating AI Agent Documentation...'), 8000);
        setTimeout(() => this.emitProgress(input.workflowId, input.agentId, 'Generating Readme...'), 12000);
        const response = await (0, AIProvider_1.generateResponse)([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], { temperature: 0.2, jsonMode: true });
        const executionTimeMs = Date.now() - startTime;
        this.updateState('running', 90, 'Parsing documentation report');
        const content = response.text || '{}';
        logger_1.mcpLogger.info('DocumentationAgent', `Execution completed in ${executionTimeMs}ms.`);
        this.updateState('running', 95, 'Documentation Generation Complete.');
        this.emitProgress(input.workflowId, input.agentId, 'Documentation Generation Complete.');
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
            this.updateState('completed', 100, 'Documentation generation completed');
            return this.resultData;
        }
        catch (error) {
            logger_1.mcpLogger.error('DocumentationAgent', 'Failed to parse LLM JSON output', error);
            this.updateState('failed', 100, 'Failed to generate structured docs JSON');
            throw new Error('Failed to generate structured docs JSON');
        }
    }
}
exports.DocumentationAgent = DocumentationAgent;
//# sourceMappingURL=documentationAgent.js.map