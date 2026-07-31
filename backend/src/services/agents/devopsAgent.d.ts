import { BaseAgent } from "./baseAgent";
export interface DevOpsAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    backendData?: any;
    architectureData?: any;
}
export interface DevOpsAgentResult {
    dockerfile: string;
    dockerCompose: string;
    githubActionsCI: string;
    githubActionsCD: string;
    nginxConfig: string;
    envTemplate: string;
    deploymentGuide: string;
    infraDiagramMermaid: string;
    monitoringSetup: string;
}
export declare class DevOpsAgent extends BaseAgent {
    validate(input: any): boolean;
    execute(input: DevOpsAgentInput): Promise<DevOpsAgentResult>;
}
//# sourceMappingURL=devopsAgent.d.ts.map