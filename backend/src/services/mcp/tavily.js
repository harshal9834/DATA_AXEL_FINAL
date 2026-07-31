"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TavilyService = void 0;
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../utils/errors");
const axios_1 = __importDefault(require("axios"));
class TavilyService {
    serviceName = 'TavilyService';
    apiKey;
    initialize() {
        this.apiKey = process.env.TAVILY_API_KEY;
        if (!this.apiKey) {
            throw new errors_1.ConfigurationError(this.serviceName, 'TAVILY_API_KEY is missing');
        }
    }
    async testConnection() {
        const start = Date.now();
        try {
            this.initialize();
            const response = await axios_1.default.post('https://api.tavily.com/search', {
                api_key: this.apiKey,
                query: 'AI',
                search_depth: 'basic',
                max_results: 1
            }, {
                timeout: 5000,
                validateStatus: () => true
            });
            logger_1.mcpLogger.logExecution(this.serviceName, true, Date.now() - start, response.status, 'Connection successful');
            return true;
        }
        catch (error) {
            logger_1.mcpLogger.logExecution(this.serviceName, false, Date.now() - start, error.response?.status || 500, error.message);
            return false;
        }
    }
    async search(query) {
        this.initialize();
        try {
            const response = await axios_1.default.post('https://api.tavily.com/search', {
                api_key: this.apiKey,
                query,
                search_depth: 'advanced'
            });
            return (response.data.results || []).map((item) => ({
                source: 'tavily',
                title: item.title,
                description: item.content,
                content: item.content,
                url: item.url,
                confidence: item.score || 0.85,
            }));
        }
        catch (error) {
            logger_1.mcpLogger.error(this.serviceName, `Search failed for query: ${query}`, error);
            throw new errors_1.NetworkError(this.serviceName, error.message);
        }
    }
}
exports.TavilyService = TavilyService;
//# sourceMappingURL=tavily.js.map