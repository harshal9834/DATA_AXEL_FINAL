"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDesignAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const logger_1 = require("../../utils/logger");
const baseAgent_1 = require("./baseAgent");
function extractJson(text) {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (m && m[1])
        return m[1];
    const f = text.indexOf("{"), l = text.lastIndexOf("}");
    if (f !== -1 && l !== -1)
        return text.substring(f, l + 1);
    return text;
}
class ApiDesignAgent extends baseAgent_1.BaseAgent {
    validate(input) { return !!(input && input.projectIdea); }
    async execute(input) {
        logger_1.mcpLogger.info("ApiDesignAgent", "Designing REST API...");
        this.updateState("running", 10, "Designing API endpoints...");
        const systemPrompt = `You are a Senior API Architect. Design a complete REST API for the given project.
Return ONLY a single valid JSON object:
{
  "baseUrl": "/api/v1",
  "version": "1.0.0",
  "authStrategy": "JWT Bearer Token",
  "endpoints": [
    {
      "method": "POST", "path": "/auth/register", "description": "Register a new user",
      "requestBody": {"email": "string", "password": "string", "name": "string"},
      "responseBody": {"user": {}, "token": "string"},
      "auth": false,
      "statusCodes": [{"code": 201, "description": "Created"}, {"code": 400, "description": "Validation Error"}]
    }
  ],
  "errorCodes": [{"code": "ERR_001", "description": "Validation failed"}, {"code": "ERR_002", "description": "Unauthorized"}],
  "openApiYaml": "openapi: 3.0.0\ninfo:\n  title: Project API\n  version: 1.0.0\npaths:\n  /auth/register:\n    post:\n      summary: Register user\n      responses:\n        201:\n          description: Created"
}`;
        const response = await (0, AIProvider_1.generateResponse)([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Design REST API for: ${input.projectIdea}` }
        ], { temperature: 0.3 });
        const text = response.text || "{}";
        const jsonStr = extractJson(text);
        try {
            this.resultData = JSON.parse(jsonStr);
        }
        catch {
            this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1"));
        }
        this.updateState("completed", 100, "API design complete");
        return this.resultData;
    }
}
exports.ApiDesignAgent = ApiDesignAgent;
//# sourceMappingURL=apiDesignAgent.js.map