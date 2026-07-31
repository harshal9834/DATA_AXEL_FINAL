"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllConnectivityTests = exports.mcpServices = void 0;
const logger_1 = require("../../utils/logger");
const github_1 = require("./github");
const context7_1 = require("./context7");
const firecrawl_1 = require("./firecrawl");
const tavily_1 = require("./tavily");
const serper_1 = require("./serper");
exports.mcpServices = {
    github: new github_1.GitHubService(),
    context7: new context7_1.Context7Service(),
    firecrawl: new firecrawl_1.FirecrawlService(),
    tavily: new tavily_1.TavilyService(),
    serper: new serper_1.SerperService(),
};
/**
 * Runs connectivity tests for all MCP services sequentially.
 * Used internally during backend startup to assess health.
 */
const runAllConnectivityTests = async () => {
    logger_1.mcpLogger.info('System', 'Starting MCP Connectivity Tests...');
    const results = {};
    for (const [name, service] of Object.entries(exports.mcpServices)) {
        try {
            results[name] = await service.testConnection();
        }
        catch (error) {
            // Catch configuration errors thrown synchronously by initialize()
            logger_1.mcpLogger.error('System', `Failed to test ${name} due to configuration error: ${error.message}`);
            results[name] = false;
        }
    }
    const successCount = Object.values(results).filter(Boolean).length;
    logger_1.mcpLogger.info('System', `MCP Connectivity Tests Completed: ${successCount}/${Object.keys(results).length} passed.`);
    return results;
};
exports.runAllConnectivityTests = runAllConnectivityTests;
//# sourceMappingURL=index.js.map