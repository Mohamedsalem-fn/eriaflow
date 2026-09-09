// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

// ─── Tenant / User ──────────────────────────────────────────────────────────
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  whatsappPhoneId?: string;
  aiProvider: AIProvider;
  monthlyConversations: number;
  createdAt: string;
}

// ─── AI ─────────────────────────────────────────────────────────────────────
export type AIProvider = 'auto' | 'openai' | 'claude' | 'gemini' | 'deepseek';
export type AgentType = 'sales' | 'support' | 'custom';
export type Language = 'ar' | 'en' | 'both';

export interface AIAgent {
  id: string;
  tenantId: string;
  name: string;
  type: AgentType;
  personality?: string;
  language: Language;
  priceMin?: number;
  priceMax?: number;
  humanHandoffThreshold: number;
  isActive: boolean;
  createdAt: string;
}

// ─── CRM ────────────────────────────────────────────────────────────────────
export type ContactStage = 'lead' | 'prospect' | 'customer' | 'churned';
export type Channel = 'whatsapp' | 'instagram' | 'email' | 'web';

export interface Contact {
  id: string;
  tenantId: string;
  name?: string;
  phone: string;
  email?: string;
  channel: Channel;
  stage: ContactStage;
  sentimentScore: number;
  totalSpent: number;
  tags: string[];
  notes?: string;
  assignedAgentId?: string;
  createdAt: string;
}

// ─── Conversations ───────────────────────────────────────────────────────────
export type ConversationStatus = 'active' | 'resolved' | 'human_takeover';
export type MessageRole = 'user' | 'assistant' | 'human';

export interface Conversation {
  id: string;
  tenantId: string;
  contactId: string;
  channel: Channel;
  status: ConversationStatus;
  agentId?: string;
  sentiment: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  whatsappMsgId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Follow-ups ──────────────────────────────────────────────────────────────
export type FollowupStatus = 'pending' | 'sent' | 'cancelled';

export interface Followup {
  id: string;
  tenantId: string;
  contactId: string;
  conversationId: string;
  scheduledAt: string;
  message: string;
  status: FollowupStatus;
  createdAt: string;
}

// ─── API Response types ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Plan limits ─────────────────────────────────────────────────────────────
export const PLAN_LIMITS: Record<Plan, { conversations: number; agents: number }> = {
  free:       { conversations: 100,       agents: 1 },
  starter:    { conversations: 1_000,     agents: 3 },
  pro:        { conversations: 5_000,     agents: 10 },
  enterprise: { conversations: Infinity,  agents: Infinity },
};

export const PLAN_PRICES: Record<Exclude<Plan, 'enterprise'>, number> = {
  free:    0,
  starter: 49,
  pro:     149,
};
