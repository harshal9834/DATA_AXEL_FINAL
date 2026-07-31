/**
 * AIProvider.ts — Central AI abstraction layer (OpenRouter)
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Safety: ensure .env is loaded even if this module is imported before server.ts
dotenv.config({ path: resolve(__dirname, '../../.env'), override: false });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProviderResponse {
  text: string;
  model: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MODELS: string[] = [
  'google/gemma-4-26b-a4b-it:free',
  'openai/gpt-4o-mini',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct',
  'openrouter/free',
];

// ─── Client factory ───────────────────────────────────────────────────────────

function createClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('[AIProvider] ❌ OPENROUTER_API_KEY is NOT set in environment variables!');
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }
  const masked = apiKey.substring(0, 8) + '...' + apiKey.slice(-4);
  console.log(`[AIProvider] ✅ OpenRouter client initialized. Key: ${masked}`);

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'AI Research & Innovation Copilot',
    },
  });
}

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = createClient();
  return _client;
}

// ─── Core single call with diagnostics ───────────────────────────────────────

async function callModel(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  jsonMode: boolean,
  maxTokens: number = 2000,
): Promise<string> {
  const client = getClient();
  console.log(`[AIProvider] → Request model=${model} messages=${messages.length} temp=${temperature} max_tokens=${maxTokens}`);

  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens, // Fix: Explicit max_tokens ensures credit checks don't default to 65k tokens causing 402 errors
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  };

  try {
    const completion = await client.chat.completions.create(params);
    const text = completion.choices[0]?.message?.content ?? '';
    console.log(`[AIProvider] ← Response model=${model} chars=${text.length}`);
    if (!text) {
      throw new Error(`Model ${model} returned empty content.`);
    }
    return text;
  } catch (err: unknown) {
    const error = err as any;
    const status = error?.status ?? error?.statusCode ?? 'unknown';
    const detail = error?.error?.message ?? error?.message ?? String(err);
    const apiKey = process.env.OPENROUTER_API_KEY || 'MISSING';
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.slice(-4);
    
    console.error(`\n=== ACTUAL RUNTIME FAILURE ===`);
    console.error(`- HTTP Status: ${status}`);
    console.error(`- Error Details: ${JSON.stringify(error?.error || error?.response?.data || detail)}`);
    console.error(`- Selected Provider: OpenRouter`);
    console.error(`- Selected Model: ${model}`);
    console.error(`- API Key Loaded (masked): ${maskedKey}`);
    console.error(`- Stack: ${error?.stack}`);
    console.error(`==============================\n`);
    throw err;
  }
}

// ─── Public: generateResponse ─────────────────────────────────────────────────

export async function generateResponse(
  messages: ChatMessage[],
  options: { temperature?: number; jsonMode?: boolean; maxTokens?: number } = {},
): Promise<AIProviderResponse> {
  const { temperature = 0.7, jsonMode = false, maxTokens = 2000 } = options;

  console.log(`[AIProvider] generateResponse() called — trying ${MODELS.length} models`);
  const errors: string[] = [];

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const text = await callModel(messages, model, temperature, jsonMode, maxTokens);
        console.log(`[AIProvider] ✅ SUCCESS model=${model} attempt=${attempt}`);
        return { text, model };
      } catch (err: unknown) {
        const error = err as any;
        const status = error?.status ?? 'unknown';
        const detail = error?.error?.message ?? error?.message ?? String(err);
        const errStr = `[model=${model} attempt=${attempt}]: HTTP ${status} - ${detail}`;
        console.warn(`[AIProvider] ⚠ ${errStr}`);
        errors.push(errStr);

        if (attempt === 1) {
          console.log(`[AIProvider] Retrying ${model}...`);
          continue;
        }
        console.log(`[AIProvider] Giving up on ${model}, moving to next.`);
      }
    }
  }

  const failureReason = `All AI models exhausted. Attempt logs:\n${errors.join('\n')}`;
  console.error(`[AIProvider] ❌ ${failureReason}`);
  throw new Error(failureReason);
}

// ─── Public: streamResponse ───────────────────────────────────────────────────

export async function streamResponse(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<AIProviderResponse> {
  const { temperature = 0.7, maxTokens = 2000 } = options;

  console.log(`[AIProvider] streamResponse() called — trying ${MODELS.length} models`);
  const errors: string[] = [];

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const client = getClient();
        console.log(`[AIProvider] → Streaming model=${model} attempt=${attempt} max_tokens=${maxTokens}`);

        const stream = await client.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        });

        let fullText = '';
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content ?? '';
          if (token) {
            fullText += token;
            onToken(token);
          }
        }

        console.log(`[AIProvider] ✅ Stream SUCCESS model=${model} chars=${fullText.length}`);
        return { text: fullText, model };
      } catch (err: unknown) {
        const error = err as any;
        const status = error?.status ?? 'unknown';
        const detail = error?.error?.message ?? error?.message ?? String(err);
        const errStr = `[Stream model=${model} attempt=${attempt}]: HTTP ${status} - ${detail}`;
        console.warn(`[AIProvider] ⚠ ${errStr}`);
        errors.push(errStr);

        if (attempt === 1) continue;
        console.log(`[AIProvider] Giving up on ${model}, moving to next.`);
      }
    }
  }

  const failureReason = `All streaming AI models exhausted. Attempt logs:\n${errors.join('\n')}`;
  console.error(`[AIProvider] ❌ ${failureReason}`);
  throw new Error(failureReason);
}
