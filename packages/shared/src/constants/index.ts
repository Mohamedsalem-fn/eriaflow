// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

export const APP_NAME = 'EriaFlow';
export const APP_TAGLINE = 'AI-Powered Sales & Support Automation';

// API versioning
export const API_VERSION = 'v1';

// AI Providers configuration
export const AI_PROVIDERS = [
  { name: 'deepseek' as const, model: 'deepseek-chat',        costPer1kTokens: 0.00014, priority: 1 },
  { name: 'gemini'   as const, model: 'gemini-2.0-flash',     costPer1kTokens: 0.00015, priority: 2 },
  { name: 'openai'   as const, model: 'gpt-4o-mini',          costPer1kTokens: 0.00015, priority: 3 },
  { name: 'claude'   as const, model: 'claude-haiku-3-5',     costPer1kTokens: 0.00025, priority: 4 },
] as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE     = 100;

// WhatsApp message types
export const WHATSAPP_MESSAGE_TYPES = ['text', 'image', 'document', 'audio', 'video'] as const;

// Sentiment thresholds
export const SENTIMENT = {
  VERY_NEGATIVE: 0.2,
  NEGATIVE:      0.4,
  NEUTRAL:       0.6,
  POSITIVE:      0.8,
  VERY_POSITIVE: 1.0,
} as const;
