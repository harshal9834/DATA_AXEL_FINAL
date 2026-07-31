import { BaseAgent } from "./baseAgent";
export interface ApiDesignInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    architectureData?: any;
    databaseData?: any;
    planningData?: any;
}
export interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
    requestBody?: any;
    responseBody?: any;
    auth: boolean;
    statusCodes: {
        code: number;
        description: string;
    }[];
}
export interface ApiDesignResult {
    baseUrl: string;
    version: string;
    authStrategy: string;
    endpoints: ApiEndpoint[];
    errorCodes: {
        code: string;
        description: string;
    }[];
    openApiYaml: string;
}
export declare class ApiDesignAgent extends BaseAgent {
    validate(input: any): boolean;
    execute(input: ApiDesignInput): Promise<ApiDesignResult>;
}
//# sourceMappingURL=apiDesignAgent.d.ts.map