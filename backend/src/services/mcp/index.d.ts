import { GitHubService } from './github';
import { Context7Service } from './context7';
import { FirecrawlService } from './firecrawl';
import { TavilyService } from './tavily';
import { SerperService } from './serper';
export declare const mcpServices: {
    github: GitHubService;
    context7: Context7Service;
    firecrawl: FirecrawlService;
    tavily: TavilyService;
    serper: SerperService;
};
/**
 * Runs connectivity tests for all MCP services sequentially.
 * Used internally during backend startup to assess health.
 */
export declare const runAllConnectivityTests: () => Promise<Record<string, boolean>>;
//# sourceMappingURL=index.d.ts.map