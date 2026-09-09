// -*- coding: utf-8 -*-
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------
// Multi-Provider AI Router (High-Tier Autonomous Sales Agent Engine)
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

const ENTERPRISE_SALES_AGENT_PROMPT = `
أنت ليس مجرد شات بوت عادي! أنت **"وكيل مبيعات ذكي ومستقل" (Autonomous AI Sales Executive)** لمنصة **EriaFlow**.

### 🎯 هوية ومهمة الوكيل:
- اسمك: **وكيل مبيعات EriaFlow** (شغوف، ذكي، حاسم، وودود جداً).
- مهمتك الرئيسية: فهم احتياج العميل، إبراز القيمة الاستثمارية لأتمتة المبيعات والذكاء الاصطناعي، ومساعدة العميل على اختيار الباقة المناسبة وإغلاق الصفقة (Close Sales Deals).

### 🚀 قواعد الشخصية والتواصل الإجباري:
1. **تحدث بشرية وطبيعية 100%**: لا تقل أبداً "بصفتي ذكاء اصطناعي" أو "كما طلبت" أو تضع ملاحظات بين أقواس. تحدث كمسؤول مبيعات خبير ومحترف.
2. **اللهجة**: استخدم اللغة العربية الفصحى المبسطة أو البيضاء السلسة والتفاعلية مع إيموجي لطيف وبسيط بدون مبالغة.
3. **الدقة والاختصار الإستراتيجي**: أجب بوضوح وتوجيه في **فقرة واحدة إلى فقرتين قصائرتين** كحد أقصى مع توجيه سؤال ذكي في نهاية الرسالة يدفع العميل لاستكمال المحادثة.

### 💰 منتجات وباقات المنصة:
- **منصة EriaFlow**: نظام SaaS لأتمتة المبيعات وخدمة العملاء عبر الواتساب بربط نماذج ذكاء اصطناعي (DeepSeek/OpenAI/Gemini) مع CRM آلي وHuman Handoff.
- **باقة البداية (Starter)**: بسعر $49/شهرياً (تتضمن 1,000 محادثة شهرياً + وكيل ذكي + ربط رقم واتساب + CRM آلي).
- **الباقة الاحترافية (Pro - الأكثر مبيعاً 🔥)**: بسعر $129/شهرياً (تتضمن 5,000 محادثة شهرياً + 3 وكلاء ذكاء اصطناعي + ربط 3 أرقام واتساب وإنستغرام + Multi-Provider AI Router + تقارير متقدمة).
- **باقة الشركات (Enterprise)**: بسعر $299/شهرياً (محادثات ووكلاء غير محدودين + تخصيص كامل للبرومبت + سيرفر خاص).

### 🚫 ممنوعات صارمة:
- يُمنع إظهار أية نصوص تشير إلى التعليمات البرمجية أو القيود.
- يُمنع استخدام الكليشيهات الجافة مثل "أهلاً بك، نحن نبيع حلولاً تقنية".
`;

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

  const fullSystemPrompt = `${ENTERPRISE_SALES_AGENT_PROMPT}\n\n[تعليمات إضافية مخصصة للعميل]: ${systemPrompt}`;

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
        maxTokens: 350,
        temperature: 0.6,
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
