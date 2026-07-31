import { mcpLogger } from '../../utils/logger';
import { GitHubService } from './github';
import { Context7Service } from './context7';
import { FirecrawlService } from './firecrawl';
import { TavilyService } from './tavily';
import { SerperService } from './serper';

export const mcpServices = {
  github: new GitHubService(),
  context7: new Context7Service(),
  firecrawl: new FirecrawlService(),
  tavily: new TavilyService(),
  serper: new SerperService(),
};

/**
 * Runs connectivity tests for all MCP services sequentially.
 * Used internally during backend startup to assess health.
 */
export const runAllConnectivityTests = async () => {
  mcpLogger.info('System', 'Starting MCP Connectivity Tests...');
  const results: Record<string, boolean> = {};

  for (const [name, service] of Object.entries(mcpServices)) {
    try {
      results[name] = await service.testConnection();
    } catch (error: any) {
      // Catch configuration errors thrown synchronously by initialize()
      mcpLogger.error('System', `Failed to test ${name} due to configuration error: ${error.message}`);
      results[name] = false;
    }
  }

  const successCount = Object.values(results).filter(Boolean).length;
  mcpLogger.info('System', `MCP Connectivity Tests Completed: ${successCount}/${Object.keys(results).length} passed.`);
  return results;
};
