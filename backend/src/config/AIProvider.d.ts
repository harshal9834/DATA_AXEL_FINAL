/**
 * AIProvider.ts — Central AI abstraction layer (OpenRouter)
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface AIProviderResponse {
    text: string;
    model: string;
}
export declare function generateResponse(messages: ChatMessage[], options?: {
    temperature?: number;
    jsonMode?: boolean;
}): Promise<AIProviderResponse>;
export declare function streamResponse(messages: ChatMessage[], onToken: (token: string) => void, options?: {
    temperature?: number;
}): Promise<AIProviderResponse>;
//# sourceMappingURL=AIProvider.d.ts.map