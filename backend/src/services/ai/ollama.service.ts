import OpenAI from 'openai';
import { ChatMessage } from '../../config/AIProvider';
import { AIProviderConfig } from './types';

export async function callOllama(messages: ChatMessage[], config: AIProviderConfig): Promise<string> {
  const client = new OpenAI({ 
    apiKey: 'ollama', 
    baseURL: 'http://localhost:11434/v1' 
  });

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), config.timeoutMs);

  try {
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: messages as any,
      response_format: { type: 'json_object' }
    }, { signal: abortController.signal as any });

    clearTimeout(timeoutId);
    return completion.choices[0]?.message?.content || '';
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
