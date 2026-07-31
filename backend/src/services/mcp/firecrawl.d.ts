import { MCPService, UnifiedResponse } from '../../types/mcp';
export declare class FirecrawlService implements MCPService {
    private readonly serviceName;
    private apiKey;
    initialize(): void;
    testConnection(): Promise<boolean>;
    crawlHomepage(url: string): Promise<UnifiedResponse[]>;
}
//# sourceMappingURL=firecrawl.d.ts.map