import { generateResponse } from "../../config/AIProvider";
import { mcpLogger } from "../../utils/logger";
import { BaseAgent } from "./baseAgent";

export interface ProjectPlanningInput {
  workflowId: string;
  agentId: string;
  projectIdea: string;
  researchData?: any;
}

export interface ProjectPlanningResult {
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  constraints: string[];
  assumptions: string[];
  riskAnalysis: { risk: string; severity: string; mitigation: string }[];
  acceptanceCriteria: string[];
  brd: { overview: string; objectives: string[]; stakeholders: string[]; scope: string; outOfScope: string; businessRules: string[] };
  prd: { productOverview: string; userPersonas: { name: string; description: string; goals: string[] }[]; coreFeatures: { feature: string; priority: string; description: string }[]; successMetrics: string[] };
  srs: { introduction: string; systemOverview: string; functionalSpec: string; nonFunctionalSpec: string; interfaces: string };
  userStories: { id: string; role: string; goal: string; benefit: string; acceptanceCriteria: string[] }[];
  useCases: { id: string; name: string; actors: string[]; preconditions: string; flow: string[]; postconditions: string }[];
  featureList: { feature: string; priority: string; complexity: string; sprint: number }[];
  roadmap: { phase: string; duration: string; deliverables: string[] }[];
  milestones: { name: string; date: string; criteria: string[] }[];
  sprintPlan: { sprint: number; goal: string; stories: string[]; points: number }[];
}

function extractJson(text: string): string {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (m && m[1]) return m[1];
  const f = text.indexOf("{"), l = text.lastIndexOf("}");
  if (f !== -1 && l !== -1) return text.substring(f, l + 1);
  return text;
}

export class ProjectPlanningAgent extends BaseAgent {
  public validate(input: any): boolean { return !!(input && input.projectIdea); }

  public async execute(input: ProjectPlanningInput): Promise<ProjectPlanningResult> {
    mcpLogger.info("ProjectPlanningAgent", "Starting project planning...");
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

    const response = await generateResponse([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Project Idea: ${input.projectIdea}${researchCtx}` }
    ], { temperature: 0.4 });

    this.updateState("running", 80, "Parsing planning document...");
    const text = response.text || "{}"; const jsonStr = extractJson(text);
    try {
      this.resultData = JSON.parse(jsonStr) as ProjectPlanningResult;
    } catch {
      this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1")) as ProjectPlanningResult;
    }
    this.updateState("completed", 100, "Project planning completed");
    return this.resultData;
  }
}
