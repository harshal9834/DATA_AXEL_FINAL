export declare class MCPError extends Error {
    status: number;
    service: string;
    constructor(message: string, status: number, service: string);
}
export declare class RateLimitError extends MCPError {
    constructor(service: string);
}
export declare class NetworkError extends MCPError {
    constructor(service: string, message?: string);
}
export declare class ConfigurationError extends MCPError {
    constructor(service: string, message?: string);
}
//# sourceMappingURL=errors.d.ts.map