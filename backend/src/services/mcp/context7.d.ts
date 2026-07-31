import { MCPService, UnifiedResponse } from '../../types/mcp';
export declare class Context7Service implements MCPService {
    private readonly serviceName;
    private apiKey;
    initialize(): void;
    testConnection(): Promise<boolean>;
    fetchDocumentation(query: string): Promise<UnifiedResponse[]>;
}
//# sourceMappingURL=context7.d.ts.map