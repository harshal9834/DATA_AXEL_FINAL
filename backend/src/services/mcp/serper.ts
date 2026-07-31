import { MCPService, UnifiedResponse } from '../../types/mcp';
import { mcpLogger } from '../../utils/logger';
import { ConfigurationError, NetworkError } from '../../utils/errors';
import axios from 'axios';

export class SerperService implements MCPService {
  private readonly serviceName = 'SerperService';
  private apiKey: string | undefined;

  initialize() {
    this.apiKey = process.env.SERPER_API_KEY;
    if (!this.apiKey) {
      throw new ConfigurationError(this.serviceName, 'SERPER_API_KEY is missing');
    }
  }

  async testConnection(): Promise<boolean> {
    const start = Date.now();
    try {
      this.initialize();
      const response = await axios.post('https://google.serper.dev/search', {
        q: 'React'
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
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
      const response = await axios.post('https://google.serper.dev/search', { q: query }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return (response.data.organic || []).map((item: any) => ({
        source: 'serper',
        title: item.title,
        description: item.snippet || '',
        content: item.snippet || '',
        url: item.link,
        confidence: 0.8,
        metadata: {
          position: item.position
        }
      }));
    } catch (error: any) {
      mcpLogger.error(this.serviceName, `Search failed for query: ${query}`, error);
      throw new NetworkError(this.serviceName, error.message);
    }
  }
}
