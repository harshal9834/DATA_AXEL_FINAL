/**
 * AIProvider.ts — Central AI abstraction layer (OpenRouter)
 *
 * Fallback chain (all confirmed working free-tier 2025-07-31):
 *  1. google/gemma-4-26b-a4b-it:free      — best quality, clean outputs
 *  2. nvidia/nemotron-3-super-120b-a12b:free — large, capable
 *  3. nvidia/nemotron-3-nano-30b-a3b:free  — fast, reliable
 *  4. openrouter/free                       — OpenRouter auto-selects best available
 *
 * REMOVED (all returned 404 as of 2025-07-31):
 *  ✗ deepseek/deepseek-chat-v3-0324:free
 *  ✗ qwen/qwen3-coder:free
 *  ✗ meta-llama/llama-3.3-70b-instruct:free
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
  'meta-llama/llama-3.3-70b-instruct',
  'google/gemini-2.5-flash',
  'openai/gpt-4o-mini',
];

const FALLBACK_ERROR_MESSAGE =
  'I am temporarily unable to access an AI model. Please try again.';

// ─── Client factory ───────────────────────────────────────────────────────────

function createClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // === Diagnostic: always log key status on first use ===
  if (!apiKey) {
    console.error('[AIProvider] ❌ OPENROUTER_API_KEY is NOT set in environment variables!');
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }
  console.log(`[AIProvider] ✅ OpenRouter client created. Key: ${apiKey.slice(0, 12)}...`);

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
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
  timeoutMs?: number
): Promise<string> {
  const client = getClient();
  console.log(`[AIProvider] → Request  model=${model} messages=${messages.length} temp=${temperature}`);

  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
    temperature,
    max_tokens: 3000,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  };

  const abortController = new AbortController();
  const timeoutId = timeoutMs ? setTimeout(() => abortController.abort(), timeoutMs) : null;

  try {
    const completion = await client.chat.completions.create(params, { signal: abortController.signal as any });
    if (timeoutId) clearTimeout(timeoutId);
    const text = completion.choices[0]?.message?.content ?? '';
    console.log(`[AIProvider] ← Response model=${model} chars=${text.length}`);
    if (!text) {
      throw new Error(`Model ${model} returned empty content.`);
    }
    return text;
  } catch (err: unknown) {
    if (timeoutId) clearTimeout(timeoutId);
    if ((err as any).name === 'AbortError') {
       console.error(`[AIProvider] ❌ TIMEOUT exceeded (${timeoutMs}ms) for model ${model}`);
       throw new Error('TIMEOUT');
    }
    const error = err as any;
    const status = error?.status ?? error?.statusCode ?? 'unknown';
    const detail = error?.error?.message ?? error?.message ?? String(err);
    const apiKey = process.env.OPENROUTER_API_KEY || 'MISSING';
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.slice(-4);
    
    console.error(`\n=== ACTUAL RUNTIME FAILURE ===`);
    console.error(`- HTTP Status: ${status}`);
    console.error(`- Response Body: ${JSON.stringify(error?.error || error?.response?.data || detail)}`);
    console.error(`- Error Stack: ${error?.stack}`);
    console.error(`- Selected Provider: OpenRouter`);
    console.error(`- Selected Model: ${model}`);
    console.error(`- API Endpoint: https://openrouter.ai/api/v1`);
    console.error(`- API Key Loaded (masked): ${maskedKey}`);
    console.error(`==============================\n`);
    throw err; // re-throw so caller can handle per-attempt retry
  }
}

// ─── Public: generateResponse ─────────────────────────────────────────────────

export async function generateResponse(
  messages: ChatMessage[],
  options: { temperature?: number; jsonMode?: boolean; timeoutMs?: number } = {},
): Promise<AIProviderResponse> {
  const { temperature = 0.7, jsonMode = false, timeoutMs } = options;

  console.log(`[AIProvider] generateResponse() called — trying ${MODELS.length} models`);

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const text = await callModel(messages, model, temperature, jsonMode, timeoutMs);
        console.log(`[AIProvider] ✅ SUCCESS model=${model} attempt=${attempt}`);
        return { text, model };
      } catch (err: unknown) {
        const error = err as any;
        if (error.message === 'TIMEOUT') {
           return { text: '{"status": "partial"}', model: 'timeout' }; // Fast fallback partial JSON
        }
        const status = error?.status ?? 'unknown';
        const detail = error?.error?.message ?? error?.message ?? String(err);
        console.warn(`[AIProvider] ⚠ model=${model} attempt=${attempt} failed: HTTP ${status} — ${detail}`);

        if (attempt === 1) {
          console.log(`[AIProvider] Retrying ${model}...`);
          continue; // retry once
        }
        console.log(`[AIProvider] Giving up on ${model}, moving to next.`);
      }
    }
  }

  console.error('[AIProvider] ❌ ALL models exhausted. Returning fallback message.');
  return { text: FALLBACK_ERROR_MESSAGE, model: 'none' };
}

// ─── Public: streamResponse ───────────────────────────────────────────────────

export async function streamResponse(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  options: { temperature?: number } = {},
): Promise<AIProviderResponse> {
  const { temperature = 0.7 } = options;

  console.log(`[AIProvider] streamResponse() called — trying ${MODELS.length} models`);

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const client = getClient();
        console.log(`[AIProvider] → Streaming model=${model} attempt=${attempt}`);

        const stream = await client.chat.completions.create({
          model,
          messages,
          temperature,
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
        console.warn(`[AIProvider] ⚠ Stream model=${model} attempt=${attempt} failed: HTTP ${status} — ${detail}`);

        if (attempt === 1) continue;
        console.log(`[AIProvider] Giving up on ${model}, moving to next.`);
      }
    }
  }

  console.error('[AIProvider] ❌ ALL streaming models exhausted.');
  onToken(FALLBACK_ERROR_MESSAGE);
  return { text: FALLBACK_ERROR_MESSAGE, model: 'none' };
}
