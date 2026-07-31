import { MCPService, UnifiedResponse } from '../../types/mcp';
export declare class GitHubService implements MCPService {
    private readonly serviceName;
    private token;
    initialize(): void;
    testConnection(): Promise<boolean>;
    searchRepository(query: string): Promise<UnifiedResponse[]>;
}
//# sourceMappingURL=github.d.ts.map