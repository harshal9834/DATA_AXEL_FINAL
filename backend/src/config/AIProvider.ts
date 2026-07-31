/**
 * AIProvider.ts — Central AI abstraction layer (Groq)
 *
 * Fallback chain:
 *  1. llama-3.3-70b-versatile
 *  2. llama3-70b-8192
 *  3. mixtral-8x7b-32768
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
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

const FALLBACK_ERROR_MESSAGE =
  'I am temporarily unable to access an AI model. Please try again.';

// ─── Client factory ───────────────────────────────────────────────────────────

function createClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY;

  // === Diagnostic: always log key status on first use ===
  if (!apiKey) {
    console.error('[AIProvider] ❌ GROQ_API_KEY is NOT set in environment variables!');
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }
  console.log(`[AIProvider] ✅ Groq client created. Key: ${apiKey.slice(0, 12)}...`);

  return new OpenAI({
    apiKey,
    baseURL: process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1',
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
): Promise<string> {
  const client = getClient();
  console.log(`[AIProvider] → Request  model=${model} messages=${messages.length} temp=${temperature}`);

  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
    temperature,
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
    const apiKey = process.env.GROQ_API_KEY || 'MISSING';
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.slice(-4);
    
    console.error(`\n=== ACTUAL RUNTIME FAILURE ===`);
    console.error(`- HTTP Status: ${status}`);
    console.error(`- Response Body: ${JSON.stringify(error?.error || error?.response?.data || detail)}`);
    console.error(`- Error Stack: ${error?.stack}`);
    console.error(`- Selected Provider: Groq`);
    console.error(`- Selected Model: ${model}`);
    console.error(`- API Endpoint: ${process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1'}`);
    console.error(`- API Key Loaded (masked): ${maskedKey}`);
    console.error(`==============================\n`);
    throw err; // re-throw so caller can handle per-attempt retry
  }
}

// ─── Public: generateResponse ─────────────────────────────────────────────────

export async function generateResponse(
  messages: ChatMessage[],
  options: { temperature?: number; jsonMode?: boolean } = {},
): Promise<AIProviderResponse> {
  const { temperature = 0.7, jsonMode = false } = options;

  console.log(`[AIProvider] generateResponse() called — trying ${MODELS.length} models`);

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const text = await callModel(messages, model, temperature, jsonMode);
        console.log(`[AIProvider] ✅ SUCCESS model=${model} attempt=${attempt}`);
        return { text, model };
      } catch (err: unknown) {
        const error = err as any;
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
