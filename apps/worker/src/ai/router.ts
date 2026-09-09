// -*- coding: utf-8 -*-
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------
// Multi-Provider AI Router (Live AI DeepSeek-V4 Direct Inference)
// -------------------------------------------------------------------------------

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { Env } from '../types/env';

const PROVIDER_CONFIGS = [
  { name: 'dahl',     model: 'deepseek-ai/DeepSeek-V4-Flash-0731', priority: 1 },
  { name: 'deepseek', model: 'deepseek-chat',                     priority: 2 },
  { name: 'gemini',   model: 'gemini-2.0-flash',                  priority: 3 },
  { name: 'openai',   model: 'gpt-4o-mini',                       priority: 4 },
] as const;

type ProviderName = typeof PROVIDER_CONFIGS[number]['name'];

export async function routeAI(options: {
  env: Env;
  tenantId: string;
  preferredProvider: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
  language: 'ar' | 'en' | 'both';
}): Promise<string | null> {
  const { env, preferredProvider, messages, systemPrompt, language } = options;

  let providerOrder = [...PROVIDER_CONFIGS].sort((a, b) => a.priority - b.priority);

  const langInstruction = language === 'ar'
    ? 'تواصل دائماً باللغة العربية الفصحى المبسطة. أجب بشكل ودود ومهني وبدون إطالة.'
    : 'Always communicate in English. Be friendly and professional.';

  const fullSystemPrompt = `${systemPrompt}\n\n${langInstruction}\n\nأجب في جملتين أو 3 جمل على الأكثر.`;

  const formattedMessages = messages
    .filter(m => m.role !== 'human')
    .map(m => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

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
        console.log(`[AI Router] Success via ${providerConfig.name}`);
        return text.trim();
      }
    } catch (err: any) {
      console.warn(`[AI Router] Provider ${providerConfig.name} failed:`, err.message);
    }
  }

  return null;
}

function buildModel(provider: ProviderName, modelId: string, env: Env) {
  switch (provider) {
    case 'dahl': {
      const dahl = createOpenAI({
        apiKey: 'dahl_5QBJenL2tFDWLrEggSDesRZjAyk5UWUBb',
        baseURL: 'https://inference.dahl.global/v1',
      });
      return dahl(modelId);
    }
    case 'deepseek': {
      if (!env.DEEPSEEK_API_KEY) return null;
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
    default:
      return null;
  }
}
