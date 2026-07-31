import { BaseAgent } from "./baseAgent";
export interface DiagramAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    architectureData?: any;
    databaseData?: any;
    planningData?: any;
}
export interface DiagramAgentResult {
    highLevelArchitecture: string;
    componentDiagram: string;
    sequenceDiagram: string;
    deploymentDiagram: string;
    flowDiagram: string;
    classDiagram: string;
    activityDiagram: string;
    stateDiagram: string;
    authFlowDiagram: string;
}
export declare class DiagramAgent extends BaseAgent {
    validate(input: any): boolean;
    execute(input: DiagramAgentInput): Promise<DiagramAgentResult>;
}
//# sourceMappingURL=diagramAgent.d.ts.map