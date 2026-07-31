import { BaseAgent } from './baseAgent';
import { BackendAgentResult } from './backendAgent';
import { FrontendAgentResult } from './frontendAgent';
import { DocumentationAgentResult } from './documentationAgent';
export interface AnalysisAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    backendData: BackendAgentResult;
    frontendData: FrontendAgentResult;
    documentationData: DocumentationAgentResult;
}
export interface Issue {
    title: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    rootCause: string;
    recommendedFix: string;
    filesAffected: string[];
}
export interface AnalysisAgentResult {
    executiveSummary: string;
    issuesFound: Issue[];
    qualityScores: {
        architecture: number;
        backend: number;
        frontend: number;
        voiceAssistant: number;
        workflow: number;
        aiAgents: number;
        documentation: number;
        security: number;
        performance: number;
        maintainability: number;
        scalability: number;
    };
    productionReadinessChecklist: string[];
    finalReadinessPercentage: number;
}
export declare class AnalysisAgent extends BaseAgent {
    constructor();
    validate(input: any): boolean;
    private emitProgress;
    execute(input: AnalysisAgentInput): Promise<AnalysisAgentResult>;
}
//# sourceMappingURL=analysisAgent.d.ts.map