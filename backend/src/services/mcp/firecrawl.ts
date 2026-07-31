import { MCPService, UnifiedResponse } from '../../types/mcp';
import { mcpLogger } from '../../utils/logger';
import { ConfigurationError, NetworkError } from '../../utils/errors';
import axios from 'axios';

export class FirecrawlService implements MCPService {
  private readonly serviceName = 'FirecrawlService';
  private apiKey: string | undefined;

  initialize() {
    this.apiKey = process.env.FIRECRAWL_API_KEY;
    if (!this.apiKey) {
      throw new ConfigurationError(this.serviceName, 'FIRECRAWL_API_KEY is missing');
    }
  }

  async testConnection(): Promise<boolean> {
    const start = Date.now();
    try {
      this.initialize();
      // Lightweight test: scrape example.com
      const response = await axios.post('https://api.firecrawl.dev/v0/scrape', {
        url: 'https://example.com'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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

  async crawlHomepage(url: string): Promise<UnifiedResponse[]> {
    this.initialize();
    try {
      const response = await axios.post('https://api.firecrawl.dev/v0/scrape', { url }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data.data;
      return [{
        source: 'firecrawl',
        title: data?.metadata?.title || url,
        description: data?.metadata?.description || '',
        content: data?.content || '',
        url: url,
        confidence: 0.9,
      }];
    } catch (error: any) {
      mcpLogger.error(this.serviceName, `Crawl failed for URL: ${url}`, error);
      throw new NetworkError(this.serviceName, error.message);
    }
  }
}
