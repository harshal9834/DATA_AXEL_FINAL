"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirecrawlService = void 0;
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../utils/errors");
const axios_1 = __importDefault(require("axios"));
class FirecrawlService {
    serviceName = 'FirecrawlService';
    apiKey;
    initialize() {
        this.apiKey = process.env.FIRECRAWL_API_KEY;
        if (!this.apiKey) {
            throw new errors_1.ConfigurationError(this.serviceName, 'FIRECRAWL_API_KEY is missing');
        }
    }
    async testConnection() {
        const start = Date.now();
        try {
            this.initialize();
            // Lightweight test: scrape example.com
            const response = await axios_1.default.post('https://api.firecrawl.dev/v0/scrape', {
                url: 'https://example.com'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
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
    async crawlHomepage(url) {
        this.initialize();
        try {
            const response = await axios_1.default.post('https://api.firecrawl.dev/v0/scrape', { url }, {
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
        }
        catch (error) {
            logger_1.mcpLogger.error(this.serviceName, `Crawl failed for URL: ${url}`, error);
            throw new errors_1.NetworkError(this.serviceName, error.message);
        }
    }
}
exports.FirecrawlService = FirecrawlService;
//# sourceMappingURL=firecrawl.js.map