import { BaseAgent } from "./baseAgent";
export interface TestingAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    backendData?: any;
    apiData?: any;
}
export interface TestingAgentResult {
    testStrategy: string;
    unitTests: {
        component: string;
        testCase: string;
        code: string;
    }[];
    integrationTests: {
        scenario: string;
        steps: string[];
        expectedResult: string;
    }[];
    apiTests: {
        endpoint: string;
        method: string;
        testCase: string;
        payload: any;
        expectedStatus: number;
    }[];
    e2eTests: {
        scenario: string;
        steps: string[];
    }[];
    performanceTests: {
        test: string;
        threshold: string;
    }[];
    securityTests: {
        test: string;
        type: string;
        description: string;
    }[];
    testingTools: string[];
    coverageTargets: {
        unit: string;
        integration: string;
        e2e: string;
    };
}
export declare class TestingAgent extends BaseAgent {
    validate(input: any): boolean;
    execute(input: TestingAgentInput): Promise<TestingAgentResult>;
}
//# sourceMappingURL=testingAgent.d.ts.map