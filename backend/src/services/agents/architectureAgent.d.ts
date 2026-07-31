import { ResearchAgentResult } from './researchAgent';
import { InnovationAgentResult } from './innovationAgent';
export interface ArchitectureAgentInput {
    workflowId: string;
    agentId: string;
    projectIdea: string;
    researchData: ResearchAgentResult;
    innovationData: InnovationAgentResult;
}
export interface DatabaseEntity {
    name: string;
    fields: {
        name: string;
        type: string;
        isPrimaryKey?: boolean;
        isForeignKey?: boolean;
        references?: string;
    }[];
    relationships: string[];
    indexes: string[];
}
export interface ApiEndpoint {
    method: string;
    route: string;
    purpose: string;
    authenticationRequired: boolean;
    input: string;
    output: string;
    validation: string;
}
export interface ImplementationModule {
    name: string;
    description: string;
    tasks: string[];
}
export interface ArchitectureAgentResult {
    executiveArchitectureSummary: string;
    recommendedTechnologyStack: {
        frontend: string;
        backend: string;
        database: string;
        authentication: string;
        storage: string;
        deployment: string;
    };
    frontendArchitecture: string;
    backendArchitecture: string;
    databaseArchitecture: string;
    authenticationStrategy: string;
    authorizationStrategy: string;
    folderStructure: string;
    databaseSchema: {
        entities: DatabaseEntity[];
        suggestedDatabase: string;
        futureExpansionTables: string[];
    };
    apiBlueprint: ApiEndpoint[];
    serviceLayerDesign: string;
    repositoryLayerDesign: string;
    validationLayer: string;
    loggingStrategy: string;
    cachingStrategy: string;
    queueStrategy: string;
    fileStorageStrategy: string;
    securityArchitecture: string;
    performanceStrategy: string;
    scalabilityStrategy: string;
    deploymentStrategy: string;
    monitoringStrategy: string;
    cicdRecommendations: string;
    implementationRoadmap: ImplementationModule[];
    textualDiagrams: {
        systemFlow: string;
        dataFlow: string;
    };
}
import { BaseAgent } from './baseAgent';
export declare class ArchitectureAgent extends BaseAgent {
    constructor();
    validate(input: any): boolean;
    private emitProgress;
    execute(input: ArchitectureAgentInput): Promise<ArchitectureAgentResult>;
}
//# sourceMappingURL=architectureAgent.d.ts.map