// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import type { D1Database, KVNamespace, Queue } from '@cloudflare/workers-types';

export interface Env {
  // D1 Database
  DB: D1Database;

  // KV for caching & rate limiting
  CACHE: KVNamespace;

  // Cloudflare Queue for follow-ups
  FOLLOWUP_QUEUE: Queue;

  // Environment
  ENVIRONMENT: 'development' | 'production';
  API_VERSION: string;
  CORS_ORIGIN: string;

  // Auth
  SUPABASE_JWT_SECRET: string;

  // AI Providers
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
  DEEPSEEK_API_KEY: string;

  // WhatsApp
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_ACCESS_TOKEN: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}
