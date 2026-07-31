import { BaseAgent } from './baseAgent';
import { BackendAgentResult } from './backendAgent';
export interface FrontendAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    backendData: BackendAgentResult;
}
export interface FrontendAgentResult {
    pagesCreated: {
        name: string;
        code: string;
        description: string;
        route: string;
    }[];
    componentsCreated: {
        name: string;
        code: string;
        description: string;
    }[];
    formsGenerated: {
        name: string;
        code: string;
        description: string;
    }[];
    hooksCreated: {
        name: string;
        code: string;
        description: string;
    }[];
    apisConnected: string[];
    filesModified: string[];
    responsiveSupport: string;
    pendingDocumentationTasks: string[];
}
export declare class FrontendAgent extends BaseAgent {
    constructor();
    validate(input: any): boolean;
    private emitProgress;
    private getExistingFrontendStructure;
    execute(input: FrontendAgentInput): Promise<FrontendAgentResult>;
}
//# sourceMappingURL=frontendAgent.d.ts.map