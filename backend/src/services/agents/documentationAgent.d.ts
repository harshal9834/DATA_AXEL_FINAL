import { BaseAgent } from './baseAgent';
import { BackendAgentResult } from './backendAgent';
import { FrontendAgentResult } from './frontendAgent';
export interface DocumentationAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    backendData: BackendAgentResult;
    frontendData: FrontendAgentResult;
}
export interface DocumentationAgentResult {
    readme: string;
    apiDocumentation: string;
    databaseDocumentation: string;
    workflowDocumentation: string;
    aiAgentDocumentation: string;
    deploymentGuide: string;
    documentsGenerated: string[];
    pendingAnalysisTasks: string[];
}
export declare class DocumentationAgent extends BaseAgent {
    constructor();
    validate(input: any): boolean;
    private emitProgress;
    execute(input: DocumentationAgentInput): Promise<DocumentationAgentResult>;
}
//# sourceMappingURL=documentationAgent.d.ts.map