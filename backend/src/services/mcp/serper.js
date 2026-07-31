"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerperService = void 0;
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../utils/errors");
const axios_1 = __importDefault(require("axios"));
class SerperService {
    serviceName = 'SerperService';
    apiKey;
    initialize() {
        this.apiKey = process.env.SERPER_API_KEY;
        if (!this.apiKey) {
            throw new errors_1.ConfigurationError(this.serviceName, 'SERPER_API_KEY is missing');
        }
    }
    async testConnection() {
        const start = Date.now();
        try {
            this.initialize();
            const response = await axios_1.default.post('https://google.serper.dev/search', {
                q: 'React'
            }, {
                headers: {
                    'X-API-KEY': this.apiKey,
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
    async search(query) {
        this.initialize();
        try {
            const response = await axios_1.default.post('https://google.serper.dev/search', { q: query }, {
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return (response.data.organic || []).map((item) => ({
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
        }
        catch (error) {
            logger_1.mcpLogger.error(this.serviceName, `Search failed for query: ${query}`, error);
            throw new errors_1.NetworkError(this.serviceName, error.message);
        }
    }
}
exports.SerperService = SerperService;
//# sourceMappingURL=serper.js.map