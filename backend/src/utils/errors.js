"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.NetworkError = exports.RateLimitError = exports.MCPError = void 0;
class MCPError extends Error {
    status;
    service;
    constructor(message, status, service) {
        super(message);
        this.name = 'MCPError';
        this.status = status;
        this.service = service;
    }
}
exports.MCPError = MCPError;
class RateLimitError extends MCPError {
    constructor(service) {
        super(`Rate limit exceeded for service: ${service}`, 429, service);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class NetworkError extends MCPError {
    constructor(service, message = 'Network error occurred') {
        super(message, 503, service);
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
class ConfigurationError extends MCPError {
    constructor(service, message = 'Configuration error') {
        super(message, 500, service);
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
//# sourceMappingURL=errors.js.map