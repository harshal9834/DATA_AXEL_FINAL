import { generateResponse } from "../../config/AIProvider";
import { mcpLogger } from "../../utils/logger";
import { BaseAgent } from "./baseAgent";

export interface ApiDesignInput {
  workflowId: string; agentId: string; projectIdea: string;
  architectureData?: any; databaseData?: any; planningData?: any;
}
export interface ApiEndpoint {
  method: string; path: string; description: string;
  requestBody?: any; responseBody?: any; auth: boolean;
  statusCodes: { code: number; description: string }[];
}
export interface ApiDesignResult {
  baseUrl: string; version: string; authStrategy: string;
  endpoints: ApiEndpoint[];
  errorCodes: { code: string; description: string }[];
  openApiYaml: string;
}

function extractJson(text: string): string {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (m && m[1]) return m[1];
  const f = text.indexOf("{"), l = text.lastIndexOf("}");
  if (f !== -1 && l !== -1) return text.substring(f, l + 1);
  return text;
}

export class ApiDesignAgent extends BaseAgent {
  public validate(input: any): boolean { return !!(input && input.projectIdea); }

  public async execute(input: ApiDesignInput): Promise<ApiDesignResult> {
    mcpLogger.info("ApiDesignAgent", "Designing REST API...");
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

    const response = await generateResponse([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Design REST API for: ${input.projectIdea}` }
    ], { temperature: 0.3 });

    const text = response.text || "{}"; const jsonStr = extractJson(text);
    try { this.resultData = JSON.parse(jsonStr); } catch { this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1")); }
    this.updateState("completed", 100, "API design complete");
    return this.resultData;
  }
}
