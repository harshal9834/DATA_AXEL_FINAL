"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseAgent = void 0;
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
class DatabaseAgent extends baseAgent_1.BaseAgent {
    validate(input) { return !!(input && input.projectIdea); }
    async execute(input) {
        logger_1.mcpLogger.info("DatabaseAgent", "Starting database design...");
        this.updateState("running", 10, "Designing database schema...");
        const systemPrompt = `You are a Senior Database Architect. Generate a complete database design.
Return ONLY a single valid JSON object (no markdown, no explanation):
{
  "entities": [{"name": "User", "description": "string", "attributes": [{"name": "id", "type": "UUID", "constraints": "PRIMARY KEY"}]}],
  "relationships": [{"from": "User", "to": "Post", "type": "one-to-many", "description": "string"}],
  "erdMermaid": "erDiagram\\n  USER {\\n    uuid id PK\\n    string email\\n  }\\n  USER ||--o{ POST : creates",
  "sqlSchema": "CREATE TABLE users (\\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\\n  email VARCHAR(255) UNIQUE NOT NULL\\n);",
  "prismaSchema": "model User {\\n  id    String @id @default(uuid())\\n  email String @unique\\n}",
  "indexes": ["CREATE INDEX idx_users_email ON users(email);"],
  "constraints": ["NOT NULL constraints on required fields"],
  "seedData": "INSERT INTO users VALUES (...);"
}`;
        const context = `Project: ${input.projectIdea}\n${input.planningData ? `Features: ${JSON.stringify(input.planningData.featureList || []).substring(0, 1000)}` : ""}`;
        const response = await (0, AIProvider_1.generateResponse)([
            { role: "system", content: systemPrompt },
            { role: "user", content: context }
        ], { temperature: 0.3 });
        const text = response.text || "{}";
        const jsonStr = extractJson(text);
        try {
            this.resultData = JSON.parse(jsonStr);
        }
        catch {
            this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1"));
        }
        this.updateState("completed", 100, "Database design complete");
        return this.resultData;
    }
}
exports.DatabaseAgent = DatabaseAgent;
//# sourceMappingURL=databaseAgent.js.map