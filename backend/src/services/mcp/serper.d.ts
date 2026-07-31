import { MCPService, UnifiedResponse } from '../../types/mcp';
export declare class SerperService implements MCPService {
    private readonly serviceName;
    private apiKey;
    initialize(): void;
    testConnection(): Promise<boolean>;
    search(query: string): Promise<UnifiedResponse[]>;
}
//# sourceMappingURL=serper.d.ts.map