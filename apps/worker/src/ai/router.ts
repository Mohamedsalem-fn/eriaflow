// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------
// Multi-Provider AI Router
// Priority: DeepSeek → Gemini → OpenAI → Claude (cheapest first, auto-fallback)
// -------------------------------------------------------------------------------

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { Env } from '../types/env';

// ─── Provider Config ──────────────────────────────────────────────────────────
// Eria is the default: Cloudflare Worker proxy → agentrouter.org (OpenAI-compatible)
const PROVIDER_CONFIGS = [
  { name: 'eria',     model: 'gpt-4o-mini',          costPer1kTokens: 0.00000, priority: 1 },  // Free via Eria Gateway
  { name: 'deepseek', model: 'deepseek-chat',         costPer1kTokens: 0.00014, priority: 2 },
  { name: 'gemini',   model: 'gemini-2.0-flash',      costPer1kTokens: 0.00015, priority: 3 },
  { name: 'openai',   model: 'gpt-4o-mini',           costPer1kTokens: 0.00015, priority: 4 },
  { name: 'claude',   model: 'claude-haiku-3-5',      costPer1kTokens: 0.00025, priority: 5 },
] as const;

// Eria Gateway URL (deployed Cloudflare Worker)
const ERIA_GATEWAY_URL = 'https://eria-ai-gateway.mohamedsalem-fn.workers.dev/v1';

type ProviderName = typeof PROVIDER_CONFIGS[number]['name'];

// ─── Route AI Request ─────────────────────────────────────────────────────────
export async function routeAI(options: {
  env: Env;
  tenantId: string;
  preferredProvider: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
  language: 'ar' | 'en' | 'both';
}): Promise<string | null> {
  const { env, preferredProvider, messages, systemPrompt, language } = options;

  // Build the provider order
  let providerOrder: typeof PROVIDER_CONFIGS[number][];

  if (preferredProvider === 'auto') {
    // Sort by priority (cheapest first)
    providerOrder = [...PROVIDER_CONFIGS].sort((a, b) => a.priority - b.priority);
  } else {
    // Put preferred first, then fallback to others
    const preferred = PROVIDER_CONFIGS.find(p => p.name === preferredProvider);
    const rest = PROVIDER_CONFIGS.filter(p => p.name !== preferredProvider).sort((a, b) => a.priority - b.priority);
    providerOrder = preferred ? [preferred, ...rest] : [...PROVIDER_CONFIGS];
  }

  // Build system prompt with language instruction
  const langInstruction = language === 'ar'
    ? 'تواصل دائماً باللغة العربية الفصحى المبسطة. أجب بشكل ودود ومهني.'
    : language === 'en'
    ? 'Always communicate in English. Be friendly and professional.'
    : 'Detect the customer\'s language and respond in the same language (Arabic or English).';

  const fullSystemPrompt = `${systemPrompt}\n\n${langInstruction}\n\nKeep responses concise and conversational. Maximum 3 sentences unless more detail is needed.`;

  // Format messages for AI SDK
  const formattedMessages = messages
    .filter(m => m.role !== 'human')  // human role → map to assistant
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: m.content,
    }));

  // Try providers in order with auto-fallback
  for (const providerConfig of providerOrder) {
    try {
      const model = buildModel(providerConfig.name, providerConfig.model, env);
      if (!model) continue;

      const { text } = await generateText({
        model,
        system: fullSystemPrompt,
        messages: formattedMessages,
        maxTokens: 500,
        temperature: 0.7,
      });

      if (text && text.trim().length > 0) {
        console.log(`[AI Router] Success via provider: ${providerConfig.name}, model: ${providerConfig.model}`);
        return text;
      }
    } catch (err) {
      console.warn(`[AI Router] Provider ${providerConfig.name} failed:`, (err as Error).message);
    }
  }

  console.error('[AI Router] All AI providers failed or missing keys');
  return null;
}

// ─── Build Model Instance ─────────────────────────────────────────────────────
function buildModel(provider: ProviderName, modelId: string, env: Env) {
  switch (provider) {
    case 'eria': {
      // Eria is always available — uses the Cloudflare Worker proxy, no API key needed
      const eria = createOpenAI({
        apiKey: 'eria-gateway',   // placeholder — gateway handles auth
        baseURL: ERIA_GATEWAY_URL,
      });
      return eria(modelId);
    }

    case 'deepseek': {
      if (!env.DEEPSEEK_API_KEY) return null;
      // DeepSeek is OpenAI-compatible
      const deepseek = createOpenAI({
        apiKey: env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
      });
      return deepseek(modelId);
    }

    case 'gemini': {
      if (!env.GOOGLE_GENERATIVE_AI_API_KEY) return null;
      const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });
      return google(modelId);
    }

    case 'openai': {
      if (!env.OPENAI_API_KEY) return null;
      const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
      return openai(modelId);
    }

    case 'claude': {
      if (!env.ANTHROPIC_API_KEY) return null;
      const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
      return anthropic(modelId);
    }

    default:
      return null;
  }
}
