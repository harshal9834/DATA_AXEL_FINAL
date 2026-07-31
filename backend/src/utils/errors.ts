export class MCPError extends Error {
  public status: number;
  public service: string;

  constructor(message: string, status: number, service: string) {
    super(message);
    this.name = 'MCPError';
    this.status = status;
    this.service = service;
  }
}

export class RateLimitError extends MCPError {
  constructor(service: string) {
    super(`Rate limit exceeded for service: ${service}`, 429, service);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends MCPError {
  constructor(service: string, message: string = 'Network error occurred') {
    super(message, 503, service);
    this.name = 'NetworkError';
  }
}

export class ConfigurationError extends MCPError {
  constructor(service: string, message: string = 'Configuration error') {
    super(message, 500, service);
    this.name = 'ConfigurationError';
  }
}
