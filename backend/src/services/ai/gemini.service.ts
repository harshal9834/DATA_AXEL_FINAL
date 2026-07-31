import OpenAI from 'openai';
import { ChatMessage } from '../../config/AIProvider';
import { AIProviderConfig } from './types';

export async function callGemini(messages: ChatMessage[], config: AIProviderConfig): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const client = new OpenAI({ 
    apiKey, 
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' 
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
