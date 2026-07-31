"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const logger_1 = require("../../utils/logger");
const server_1 = require("../../server");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const baseAgent_1 = require("./baseAgent");
class BackendAgent extends baseAgent_1.BaseAgent {
    constructor() {
        super();
    }
    validate(input) {
        return !!(input && input.architectureData);
    }
    emitProgress(workflowId, agentId, message) {
        logger_1.mcpLogger.info('BackendAgent', message);
        server_1.io.emit('ai_thinking', { workflowId, agentId, thought: message });
    }
    getExistingBackendStructure() {
        let structure = '';
        const srcPath = path_1.default.join(__dirname, '../../../src');
        const prismaPath = path_1.default.join(__dirname, '../../../../prisma/schema.prisma');
        const envPath = path_1.default.join(__dirname, '../../../../.env');
        try {
            const getTree = (dir, depth = 0) => {
                if (depth > 4)
                    return '';
                let tree = '';
                if (!fs_1.default.existsSync(dir))
                    return tree;
                const files = fs_1.default.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path_1.default.join(dir, file);
                    const stat = fs_1.default.statSync(fullPath);
                    tree += '  '.repeat(depth) + '- ' + file + '\n';
                    if (stat.isDirectory()) {
                        tree += getTree(fullPath, depth + 1);
                    }
                    else if (['server.ts', 'app.ts', 'index.ts', 'routes.ts'].includes(file) || file.endsWith('routes.ts') || file.endsWith('controller.ts')) {
                        // Read contents of critical structural files
                        try {
                            const content = fs_1.default.readFileSync(fullPath, 'utf8');
                            // Only include first 100 lines to avoid blowing up context size too much
                            const shortContent = content.split('\\n').slice(0, 100).join('\\n');
                            tree += '  '.repeat(depth + 1) + '--- FILE CONTENT START ---\n' + shortContent + '\n' + '  '.repeat(depth + 1) + '--- FILE CONTENT END ---\n';
                        }
                        catch (e) { }
                    }
                }
                return tree;
            };
            structure += '--- EXISTING BACKEND STRUCTURE & ROUTES ---\n';
            structure += getTree(srcPath);
            if (fs_1.default.existsSync(prismaPath)) {
                structure += '\n--- EXISTING PRISMA SCHEMA ---\n';
                structure += fs_1.default.readFileSync(prismaPath, 'utf8');
            }
            if (fs_1.default.existsSync(envPath)) {
                structure += '\n--- EXISTING ENVIRONMENT VARIABLES (KEYS ONLY) ---\n';
                const envContent = fs_1.default.readFileSync(envPath, 'utf8');
                const keys = envContent.split('\\n').filter(l => l.includes('=')).map(l => l.split('=')[0]).join(', ');
                structure += keys;
            }
        }
        catch (error) {
            console.error('Error reading backend structure', error);
            structure += 'Error reading structure.\n';
        }
        return structure;
    }
    async execute(input) {
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
        const response = await (0, AIProvider_1.generateResponse)([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], { temperature: 0.3, jsonMode: true });
        const executionTimeMs = Date.now() - startTime;
        this.updateState('running', 90, 'Parsing backend report');
        const content = response.text || '{}';
        logger_1.mcpLogger.info('BackendAgent', `Execution completed in ${executionTimeMs}ms.`);
        this.updateState('running', 95, 'Backend Generation Complete.');
        this.emitProgress(input.workflowId, input.agentId, 'Backend Generation Complete.');
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
            this.updateState('completed', 100, 'Backend generation completed');
            return this.resultData;
        }
        catch (error) {
            logger_1.mcpLogger.error('BackendAgent', 'Failed to parse LLM JSON output', error);
            this.updateState('failed', 100, 'Failed to generate structured backend JSON');
            throw new Error('Failed to generate structured backend JSON');
        }
    }
}
exports.BackendAgent = BackendAgent;
//# sourceMappingURL=backendAgent.js.map