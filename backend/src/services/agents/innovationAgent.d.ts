import { ResearchAgentResult } from './researchAgent';
export interface InnovationAgentInput {
    workflowId: string;
    agentId: string;
    researchData: ResearchAgentResult;
}
export interface FeaturePrioritization {
    mustHave: string[];
    shouldHave: string[];
    niceToHave: string[];
    futureVersion: string[];
}
export interface Roadmap {
    phase1: string[];
    phase2: string[];
    phase3: string[];
    futureExpansion: string[];
}
export interface Scoring {
    innovation: number;
    technicalFeasibility: number;
    businessValue: number;
    scalability: number;
    marketDemand: number;
    aiImpact: number;
    overallProductScore: number;
}
export interface InnovationAgentResult {
    executiveInnovationSummary: string;
    uniqueSellingProposition: string;
    innovationScore: number;
    aiFeatureSuggestions: string[];
    automationOpportunities: string[];
    futureReadyFeatures: string[];
    premiumFeatures: string[];
    mvpFeatures: string[];
    phase2Features: string[];
    enterpriseFeatures: string[];
    competitiveAdvantages: string[];
    userExperienceImprovements: string[];
    accessibilitySuggestions: string[];
    scalabilityRecommendations: string[];
    securityImprovements: string[];
    performanceOptimizations: string[];
    cloudRecommendations: string[];
    businessModelSuggestions: string[];
    pricingStrategy: string;
    monetizationOpportunities: string[];
    marketOpportunities: string[];
    goToMarketSuggestions: string[];
    futureScope: string;
    riskReductionStrategies: string[];
    implementationPriority: string[];
    featurePrioritization: FeaturePrioritization;
    roadmap: Roadmap;
    scoring: Scoring;
}
import { BaseAgent } from './baseAgent';
export declare class InnovationAgent extends BaseAgent {
    constructor();
    validate(input: any): boolean;
    private emitProgress;
    execute(input: InnovationAgentInput): Promise<InnovationAgentResult>;
}
//# sourceMappingURL=innovationAgent.d.ts.map