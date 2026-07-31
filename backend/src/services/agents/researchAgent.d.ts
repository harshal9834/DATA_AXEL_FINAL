export interface ResearchAgentInput {
    workflowId: string;
    agentId: string;
    projectTitle: string;
    problemStatement: string;
    description?: string;
    technologyPreference?: string;
}
export interface ResearchAgentResult {
    executiveSummary: string;
    problemUnderstanding: string;
    existingSolutions: string[];
    competitorAnalysis: string;
    similarGithubProjects: string[];
    technologyRecommendations: string[];
    frameworkRecommendations: string[];
    libraries: string[];
    industryTrends: string;
    latestResearch: string;
    challenges: string[];
    opportunities: string[];
    suggestedFeatures: string[];
    risks: string[];
    scalabilityConsiderations: string;
    securityConsiderations: string;
    recommendedTechStack: string;
    researchConclusion: string;
}
import { BaseAgent } from './baseAgent';
export declare class ResearchAgent extends BaseAgent {
    constructor();
    validate(input: any): boolean;
    private emitProgress;
    execute(input: ResearchAgentInput): Promise<ResearchAgentResult>;
    private deduplicateResults;
}
//# sourceMappingURL=researchAgent.d.ts.map