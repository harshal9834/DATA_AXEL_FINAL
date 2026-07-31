import { BaseAgent } from "./baseAgent";
export interface ProjectPlanningInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    researchData?: any;
}
export interface ProjectPlanningResult {
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    constraints: string[];
    assumptions: string[];
    riskAnalysis: {
        risk: string;
        severity: string;
        mitigation: string;
    }[];
    acceptanceCriteria: string[];
    brd: {
        overview: string;
        objectives: string[];
        stakeholders: string[];
        scope: string;
        outOfScope: string;
        businessRules: string[];
    };
    prd: {
        productOverview: string;
        userPersonas: {
            name: string;
            description: string;
            goals: string[];
        }[];
        coreFeatures: {
            feature: string;
            priority: string;
            description: string;
        }[];
        successMetrics: string[];
    };
    srs: {
        introduction: string;
        systemOverview: string;
        functionalSpec: string;
        nonFunctionalSpec: string;
        interfaces: string;
    };
    userStories: {
        id: string;
        role: string;
        goal: string;
        benefit: string;
        acceptanceCriteria: string[];
    }[];
    useCases: {
        id: string;
        name: string;
        actors: string[];
        preconditions: string;
        flow: string[];
        postconditions: string;
    }[];
    featureList: {
        feature: string;
        priority: string;
        complexity: string;
        sprint: number;
    }[];
    roadmap: {
        phase: string;
        duration: string;
        deliverables: string[];
    }[];
    milestones: {
        name: string;
        date: string;
        criteria: string[];
    }[];
    sprintPlan: {
        sprint: number;
        goal: string;
        stories: string[];
        points: number;
    }[];
}
export declare class ProjectPlanningAgent extends BaseAgent {
    validate(input: any): boolean;
    execute(input: ProjectPlanningInput): Promise<ProjectPlanningResult>;
}
//# sourceMappingURL=projectPlanningAgent.d.ts.map