import { MCPService, UnifiedResponse } from '../../types/mcp';
import { mcpLogger } from '../../utils/logger';
import { ConfigurationError, NetworkError } from '../../utils/errors';
import axios from 'axios';

export class GitHubService implements MCPService {
  private readonly serviceName = 'GitHubService';
  private token: string | undefined;

  initialize() {
    this.token = process.env.GITHUB_TOKEN;
    if (!this.token) {
      throw new ConfigurationError(this.serviceName, 'GITHUB_TOKEN is missing');
    }
  }

  async testConnection(): Promise<boolean> {
    const start = Date.now();
    try {
      this.initialize();
      // Lightweight test: Search for a public repo
      const response = await axios.get('https://api.github.com/search/repositories?q=react&per_page=1', {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AICopilot-MCP'
        },
        timeout: 5000,
      });

      if (response.status === 200) {
        mcpLogger.logExecution(this.serviceName, true, Date.now() - start, response.status, 'Connection successful');
        return true;
      }
      throw new Error('Unexpected status code');
    } catch (error: any) {
      mcpLogger.logExecution(this.serviceName, false, Date.now() - start, error.response?.status || 500, error.message);
      return false;
    }
  }

  async searchRepository(query: string): Promise<UnifiedResponse[]> {
    this.initialize();
    try {
      const response = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AICopilot-MCP'
        },
      });

      return response.data.items.map((item: any) => ({
        source: 'github',
        title: item.full_name,
        description: item.description || '',
        content: `Stars: ${item.stargazers_count}, Forks: ${item.forks_count}`,
        url: item.html_url,
        confidence: 0.9,
        metadata: {
          language: item.language,
          updatedAt: item.updated_at
        }
      }));
    } catch (error: any) {
      mcpLogger.error(this.serviceName, `Search failed for query: ${query}`, error);
      throw new NetworkError(this.serviceName, error.message);
    }
  }
}
