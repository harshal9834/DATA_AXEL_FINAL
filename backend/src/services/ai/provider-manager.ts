import { ChatMessage } from '../../config/AIProvider';
import { AIProviderResponse } from './types';
import { callGroq } from './groq.service';
import { callGemini } from './gemini.service';
import { callOpenAI } from './openai.service';
import { callOllama } from './ollama.service';
import { generateTemplateFallback } from './fallback-generator';
import { extractAndValidateJSON } from './json-validator';
import { io } from '../../server';
import { mcpLogger } from '../../utils/logger';

interface ProviderRoute {
  name: string;
  model: string;
  timeoutMs: number;
  fn: (messages: ChatMessage[], config: any) => Promise<string>;
}

const PROVIDERS: ProviderRoute[] = [
  { name: 'groq', model: 'llama-3.3-70b-versatile', timeoutMs: 30000, fn: callGroq },
  { name: 'gemini', model: 'gemini-2.5-flash', timeoutMs: 45000, fn: callGemini },
  { name: 'openai', model: 'gpt-4o-mini', timeoutMs: 45000, fn: callOpenAI },
  { name: 'ollama', model: 'llama3', timeoutMs: 60000, fn: callOllama },
];

export class ProviderManager {
  
  static async generate(messages: ChatMessage[], fallbackType: string = 'generic', workflowId?: string): Promise<AIProviderResponse> {
    const startTime = Date.now();

    for (const provider of PROVIDERS) {
      try {
        mcpLogger.info('ProviderManager', `Trying provider: ${provider.name} with model: ${provider.model}`);
        
        if (workflowId) {
          io.emit('ai_status', { workflowId, message: `Switching AI Provider... Using ${provider.name}` });
        }

        const rawResponse = await provider.fn(messages, {
          model: provider.model,
          timeoutMs: provider.timeoutMs
        });

        const data = extractAndValidateJSON(rawResponse);

        return {
          success: true,
          provider: provider.name,
          model: provider.model,
          data,
          generationTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
        };

      } catch (err: any) {
        mcpLogger.warn('ProviderManager', `Provider ${provider.name} failed: ${err.message}`);
        if (workflowId) {
          io.emit('ai_status', { workflowId, message: `${provider.name} failed. Retrying...` });
        }
        // continue to next provider
      }
    }

    mcpLogger.warn('ProviderManager', 'All AI providers failed. Using template fallback.');
    if (workflowId) {
      io.emit('ai_status', { workflowId, message: `Generating using backup template...` });
    }

    const data = generateTemplateFallback(JSON.stringify(messages), fallbackType);
    
    return {
      success: true,
      provider: 'template-generator',
      model: 'fallback',
      data,
      generationTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
    };
  }
}
