import { MCPService, UnifiedResponse } from '../../types/mcp';
import { mcpLogger } from '../../utils/logger';
import { ConfigurationError, NetworkError } from '../../utils/errors';
import axios from 'axios';

export class TavilyService implements MCPService {
  private readonly serviceName = 'TavilyService';
  private apiKey: string | undefined;

  initialize() {
    this.apiKey = process.env.TAVILY_API_KEY;
    if (!this.apiKey) {
      throw new ConfigurationError(this.serviceName, 'TAVILY_API_KEY is missing');
    }
  }

  async testConnection(): Promise<boolean> {
    const start = Date.now();
    try {
      this.initialize();
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.apiKey,
        query: 'AI',
        search_depth: 'basic',
        max_results: 1
      }, {
        timeout: 5000,
        validateStatus: () => true 
      });

      mcpLogger.logExecution(this.serviceName, true, Date.now() - start, response.status, 'Connection successful');
      return true;
    } catch (error: any) {
      mcpLogger.logExecution(this.serviceName, false, Date.now() - start, error.response?.status || 500, error.message);
      return false;
    }
  }

  async search(query: string): Promise<UnifiedResponse[]> {
    this.initialize();
    try {
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.apiKey,
        query,
        search_depth: 'advanced'
      });

      return (response.data.results || []).map((item: any) => ({
        source: 'tavily',
        title: item.title,
        description: item.content,
        content: item.content,
        url: item.url,
        confidence: item.score || 0.85,
      }));
    } catch (error: any) {
      mcpLogger.error(this.serviceName, `Search failed for query: ${query}`, error);
      throw new NetworkError(this.serviceName, error.message);
    }
  }
}
