export interface UnifiedResponse {
    source: string;
    title: string;
    description: string;
    content: string;
    url: string;
    confidence: number;
    metadata?: Record<string, any>;
}
export interface MCPService {
    /**
     * Initializes the service and validates any required configuration.
     */
    initialize(): void;
    /**
     * Internal connectivity check to ensure the external API is reachable.
     */
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=mcp.d.ts.map