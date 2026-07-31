"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectPlanningAgent = void 0;
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
class ProjectPlanningAgent extends baseAgent_1.BaseAgent {
    validate(input) { return !!(input && input.projectIdea); }
    async execute(input) {
        logger_1.mcpLogger.info("ProjectPlanningAgent", "Starting project planning...");
        this.updateState("running", 10, "Analyzing project requirements...");
        const researchCtx = input.researchData
            ? `\n\nResearch Insights:\n${JSON.stringify(input.researchData).substring(0, 2000)}`
            : "";
        const systemPrompt = `You are a Senior Product Manager and Business Analyst.
Generate a comprehensive project planning document as a single valid JSON object.
Return ONLY the JSON, no markdown, no explanation.
Schema:
{
  "functionalRequirements": ["string"],
  "nonFunctionalRequirements": ["string"],
  "constraints": ["string"],
  "assumptions": ["string"],
  "riskAnalysis": [{"risk": "string", "severity": "High", "mitigation": "string"}],
  "acceptanceCriteria": ["string"],
  "brd": {"overview": "string", "objectives": ["string"], "stakeholders": ["string"], "scope": "string", "outOfScope": "string", "businessRules": ["string"]},
  "prd": {"productOverview": "string", "userPersonas": [{"name": "string", "description": "string", "goals": ["string"]}], "coreFeatures": [{"feature": "string", "priority": "Must Have", "description": "string"}], "successMetrics": ["string"]},
  "srs": {"introduction": "string", "systemOverview": "string", "functionalSpec": "string", "nonFunctionalSpec": "string", "interfaces": "string"},
  "userStories": [{"id": "US-001", "role": "string", "goal": "string", "benefit": "string", "acceptanceCriteria": ["string"]}],
  "useCases": [{"id": "UC-001", "name": "string", "actors": ["string"], "preconditions": "string", "flow": ["string"], "postconditions": "string"}],
  "featureList": [{"feature": "string", "priority": "Must Have", "complexity": "Medium", "sprint": 1}],
  "roadmap": [{"phase": "string", "duration": "string", "deliverables": ["string"]}],
  "milestones": [{"name": "string", "date": "Week 4", "criteria": ["string"]}],
  "sprintPlan": [{"sprint": 1, "goal": "string", "stories": ["string"], "points": 20}]
}`;
        const response = await (0, AIProvider_1.generateResponse)([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Project Idea: ${input.projectIdea}${researchCtx}` }
        ], { temperature: 0.4 });
        this.updateState("running", 80, "Parsing planning document...");
        const text = response.text || "{}";
        const jsonStr = extractJson(text);
        try {
            this.resultData = JSON.parse(jsonStr);
        }
        catch {
            this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1"));
        }
        this.updateState("completed", 100, "Project planning completed");
        return this.resultData;
    }
}
exports.ProjectPlanningAgent = ProjectPlanningAgent;
//# sourceMappingURL=projectPlanningAgent.js.map