export interface AIProviderResponse {
  success: boolean;
  provider: string;
  model: string;
  data: any;
  generationTime: string;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model: string;
  timeoutMs: number;
}
