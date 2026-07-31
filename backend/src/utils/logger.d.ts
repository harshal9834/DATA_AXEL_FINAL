/**
 * Structured logger for MCP services
 * Ensures secrets are not leaked and output is consistent.
 */
export declare const mcpLogger: {
    info: (serviceName: string, message: string, meta?: any) => void;
    error: (serviceName: string, message: string, error?: any) => void;
    warn: (serviceName: string, message: string, meta?: any) => void;
    logExecution: (serviceName: string, success: boolean, durationMs: number, status: number, message?: string) => void;
};
//# sourceMappingURL=logger.d.ts.map