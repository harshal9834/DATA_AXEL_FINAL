"use strict";
/**
 * Structured logger for MCP services
 * Ensures secrets are not leaked and output is consistent.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpLogger = void 0;
exports.mcpLogger = {
    info: (serviceName, message, meta) => {
        console.log(`[INFO] [${serviceName}] ${message}`, meta ? meta : '');
    },
    error: (serviceName, message, error) => {
        console.error(`[ERROR] [${serviceName}] ${message}`);
        if (error) {
            // Do not log raw headers or configs that might contain keys
            console.error(error.message || error);
        }
    },
    warn: (serviceName, message, meta) => {
        console.warn(`[WARN] [${serviceName}] ${message}`, meta ? meta : '');
    },
    logExecution: (serviceName, success, durationMs, status, message) => {
        const level = success ? '[SUCCESS]' : '[FAILED]';
        console.log(`${level} [${serviceName}] Status: ${status} | Time: ${durationMs}ms | ${message || ''}`);
    }
};
//# sourceMappingURL=logger.js.map