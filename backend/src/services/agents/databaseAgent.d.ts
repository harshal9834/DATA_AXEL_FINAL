import { BaseAgent } from "./baseAgent";
export interface DatabaseAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    architectureData?: any;
    planningData?: any;
}
export interface DatabaseAgentResult {
    entities: {
        name: string;
        description: string;
        attributes: {
            name: string;
            type: string;
            constraints: string;
        }[];
    }[];
    relationships: {
        from: string;
        to: string;
        type: string;
        description: string;
    }[];
    erdMermaid: string;
    sqlSchema: string;
    prismaSchema: string;
    indexes: string[];
    constraints: string[];
    seedData: string;
}
export declare class DatabaseAgent extends BaseAgent {
    validate(input: any): boolean;
    execute(input: DatabaseAgentInput): Promise<DatabaseAgentResult>;
}
//# sourceMappingURL=databaseAgent.d.ts.map