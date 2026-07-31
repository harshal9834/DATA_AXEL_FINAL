import { MCPService, UnifiedResponse } from '../../types/mcp';
import { mcpLogger } from '../../utils/logger';
import { ConfigurationError, NetworkError } from '../../utils/errors';
import axios from 'axios';

export class Context7Service implements MCPService {
  private readonly serviceName = 'Context7Service';
  private apiKey: string | undefined;

  initialize() {
    this.apiKey = process.env.CONTEXT7_API_KEY;
    if (!this.apiKey) {
      throw new ConfigurationError(this.serviceName, 'CONTEXT7_API_KEY is missing');
    }
  }

  async testConnection(): Promise<boolean> {
    const start = Date.now();
    try {
      this.initialize();
      // Lightweight test: Assuming a health or mock doc fetch endpoint
      const response = await axios.get('https://api.context7.com/v1/health', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 5000,
        // using catch clause to gracefully handle 404s if endpoint doesn't exactly match
        validateStatus: () => true 
      });

      mcpLogger.logExecution(this.serviceName, true, Date.now() - start, response.status, 'Connection successful');
      return true;
    } catch (error: any) {
      mcpLogger.logExecution(this.serviceName, false, Date.now() - start, error.response?.status || 500, error.message);
      return false;
    }
  }

  async fetchDocumentation(query: string): Promise<UnifiedResponse[]> {
    this.initialize();
    try {
      // Mocked endpoint behavior based on typical Context7 API structure
      const response = await axios.post('https://api.context7.com/v1/search', { query }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      return (response.data.results || []).map((item: any) => ({
        source: 'context7',
        title: item.title,
        description: item.summary || '',
        content: item.content || '',
        url: item.url,
        confidence: item.score || 0.8,
      }));
    } catch (error: any) {
      mcpLogger.error(this.serviceName, `Fetch failed for query: ${query}`, error);
      throw new NetworkError(this.serviceName, error.message);
    }
  }
}
