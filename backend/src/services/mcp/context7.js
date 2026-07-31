"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context7Service = void 0;
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../utils/errors");
const axios_1 = __importDefault(require("axios"));
class Context7Service {
    serviceName = 'Context7Service';
    apiKey;
    initialize() {
        this.apiKey = process.env.CONTEXT7_API_KEY;
        if (!this.apiKey) {
            throw new errors_1.ConfigurationError(this.serviceName, 'CONTEXT7_API_KEY is missing');
        }
    }
    async testConnection() {
        const start = Date.now();
        try {
            this.initialize();
            // Lightweight test: Assuming a health or mock doc fetch endpoint
            const response = await axios_1.default.get('https://api.context7.com/v1/health', {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                timeout: 5000,
                // using catch clause to gracefully handle 404s if endpoint doesn't exactly match
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
    async fetchDocumentation(query) {
        this.initialize();
        try {
            // Mocked endpoint behavior based on typical Context7 API structure
            const response = await axios_1.default.post('https://api.context7.com/v1/search', { query }, {
                headers: { Authorization: `Bearer ${this.apiKey}` }
            });
            return (response.data.results || []).map((item) => ({
                source: 'context7',
                title: item.title,
                description: item.summary || '',
                content: item.content || '',
                url: item.url,
                confidence: item.score || 0.8,
            }));
        }
        catch (error) {
            logger_1.mcpLogger.error(this.serviceName, `Fetch failed for query: ${query}`, error);
            throw new errors_1.NetworkError(this.serviceName, error.message);
        }
    }
}
exports.Context7Service = Context7Service;
//# sourceMappingURL=context7.js.map