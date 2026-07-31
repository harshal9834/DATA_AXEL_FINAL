import { MCPService, UnifiedResponse } from '../../types/mcp';
export declare class TavilyService implements MCPService {
    private readonly serviceName;
    private apiKey;
    initialize(): void;
    testConnection(): Promise<boolean>;
    search(query: string): Promise<UnifiedResponse[]>;
}
//# sourceMappingURL=tavily.d.ts.map