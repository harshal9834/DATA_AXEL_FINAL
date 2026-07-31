"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../utils/errors");
const axios_1 = __importDefault(require("axios"));
class GitHubService {
    serviceName = 'GitHubService';
    token;
    initialize() {
        this.token = process.env.GITHUB_TOKEN;
        if (!this.token) {
            throw new errors_1.ConfigurationError(this.serviceName, 'GITHUB_TOKEN is missing');
        }
    }
    async testConnection() {
        const start = Date.now();
        try {
            this.initialize();
            // Lightweight test: Search for a public repo
            const response = await axios_1.default.get('https://api.github.com/search/repositories?q=react&per_page=1', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'AICopilot-MCP'
                },
                timeout: 5000,
            });
            if (response.status === 200) {
                logger_1.mcpLogger.logExecution(this.serviceName, true, Date.now() - start, response.status, 'Connection successful');
                return true;
            }
            throw new Error('Unexpected status code');
        }
        catch (error) {
            logger_1.mcpLogger.logExecution(this.serviceName, false, Date.now() - start, error.response?.status || 500, error.message);
            return false;
        }
    }
    async searchRepository(query) {
        this.initialize();
        try {
            const response = await axios_1.default.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'AICopilot-MCP'
                },
            });
            return response.data.items.map((item) => ({
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
        }
        catch (error) {
            logger_1.mcpLogger.error(this.serviceName, `Search failed for query: ${query}`, error);
            throw new errors_1.NetworkError(this.serviceName, error.message);
        }
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=github.js.map