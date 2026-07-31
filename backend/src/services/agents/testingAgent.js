"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestingAgent = void 0;
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
class TestingAgent extends baseAgent_1.BaseAgent {
    validate(input) { return !!(input && input.projectIdea); }
    async execute(input) {
        logger_1.mcpLogger.info("TestingAgent", "Generating test plan...");
        this.updateState("running", 10, "Generating test strategy...");
        const systemPrompt = `You are a Senior QA Architect. Generate a complete testing plan.
Return ONLY a single valid JSON object:
{
  "testStrategy": "A comprehensive multi-layer testing approach using Jest, Playwright, and k6.",
  "unitTests": [{"component": "AuthService", "testCase": "should hash password correctly", "code": "it('hashes password', async () => { ... });"}],
  "integrationTests": [{"scenario": "User Registration Flow", "steps": ["POST /auth/register", "Verify DB record", "Verify email sent"], "expectedResult": "201 Created with user object"}],
  "apiTests": [{"endpoint": "/auth/login", "method": "POST", "testCase": "Valid credentials return JWT", "payload": {"email": "test@test.com", "password": "pass"}, "expectedStatus": 200}],
  "e2eTests": [{"scenario": "Complete user onboarding", "steps": ["Navigate to /register", "Fill form", "Submit", "Verify redirect"]}],
  "performanceTests": [{"test": "Load test: 1000 concurrent users", "threshold": "p95 < 500ms"}],
  "securityTests": [{"test": "SQL Injection on all input fields", "type": "OWASP", "description": "Test for SQL injection vulnerabilities"}],
  "testingTools": ["Jest", "Supertest", "Playwright", "k6", "OWASP ZAP"],
  "coverageTargets": {"unit": "80%", "integration": "70%", "e2e": "60%"}
}`;
        const response = await (0, AIProvider_1.generateResponse)([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate testing plan for: ${input.projectIdea}` }
        ], { temperature: 0.4 });
        const text = response.text || "{}";
        const jsonStr = extractJson(text);
        try {
            this.resultData = JSON.parse(jsonStr);
        }
        catch {
            this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1"));
        }
        this.updateState("completed", 100, "Testing plan complete");
        return this.resultData;
    }
}
exports.TestingAgent = TestingAgent;
//# sourceMappingURL=testingAgent.js.map