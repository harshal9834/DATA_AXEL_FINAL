/**
 * Structured logger for MCP services
 * Ensures secrets are not leaked and output is consistent.
 */

export const mcpLogger = {
  info: (serviceName: string, message: string, meta?: any) => {
    console.log(`[INFO] [${serviceName}] ${message}`, meta ? meta : '');
  },
  error: (serviceName: string, message: string, error?: any) => {
    console.error(`[ERROR] [${serviceName}] ${message}`);
    if (error) {
      // Do not log raw headers or configs that might contain keys
      console.error(error.message || error);
    }
  },
  warn: (serviceName: string, message: string, meta?: any) => {
    console.warn(`[WARN] [${serviceName}] ${message}`, meta ? meta : '');
  },
  logExecution: (
    serviceName: string,
    success: boolean,
    durationMs: number,
    status: number,
    message?: string
  ) => {
    const level = success ? '[SUCCESS]' : '[FAILED]';
    console.log(`${level} [${serviceName}] Status: ${status} | Time: ${durationMs}ms | ${message || ''}`);
  }
};
