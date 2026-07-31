import { ResearchAgentResult } from './researchAgent';
import { InnovationAgentResult } from './innovationAgent';
import { ArchitectureAgentResult } from './architectureAgent';
export interface BackendAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    researchData: ResearchAgentResult;
    innovationData: InnovationAgentResult;
    architectureData: ArchitectureAgentResult;
}
export interface BackendAgentResult {
    backendAnalysis: string;
    generatedAPIs: {
        endpoint: string;
        method: string;
        description: string;
        reqBody: string;
        resBody: string;
    }[];
    generatedControllers: {
        name: string;
        code: string;
        description: string;
    }[];
    generatedServices: {
        name: string;
        code: string;
        description: string;
    }[];
    generatedMiddleware: {
        name: string;
        code: string;
        description: string;
    }[];
    generatedPrismaModels: {
        modelName: string;
        schema: string;
        description: string;
    }[];
    databaseTables: string[];
    routesCreated: string[];
    filesCreated: string[];
    filesModified: string[];
    securityFeatures: string[];
    pendingFrontendTasks: string[];
}
import { BaseAgent } from './baseAgent';
export declare class BackendAgent extends BaseAgent {
    constructor();
    validate(input: any): boolean;
    private emitProgress;
    private getExistingBackendStructure;
    execute(input: BackendAgentInput): Promise<BackendAgentResult>;
}
//# sourceMappingURL=backendAgent.d.ts.map