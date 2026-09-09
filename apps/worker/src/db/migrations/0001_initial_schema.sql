-- -------------------------------------------------------------------------------
-- Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
-- Focus: AI Engineering | Automation | Agentic Systems
-- Copyright (c) 2026. All Rights Reserved.
-- -------------------------------------------------------------------------------
-- EriaFlow Database Schema — Cloudflare D1 (SQLite at the Edge)
-- -------------------------------------------------------------------------------

-- Tenants (each company = one tenant)
CREATE TABLE IF NOT EXISTS tenants (
    id                      TEXT PRIMARY KEY,
    name                    TEXT NOT NULL,
    email                   TEXT UNIQUE NOT NULL,
    plan                    TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free','starter','pro','enterprise')),
    stripe_customer_id      TEXT,
    stripe_subscription_id  TEXT,
    whatsapp_phone_id       TEXT,
    whatsapp_access_token   TEXT,
    ai_provider             TEXT NOT NULL DEFAULT 'auto' CHECK(ai_provider IN ('auto','openai','claude','gemini','deepseek')),
    monthly_conversations   INTEGER NOT NULL DEFAULT 0,
    created_at              TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AI Agents (per tenant)
CREATE TABLE IF NOT EXISTS ai_agents (
    id                       TEXT PRIMARY KEY,
    tenant_id                TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                     TEXT NOT NULL,
    type                     TEXT NOT NULL CHECK(type IN ('sales','support','custom')),
    personality              TEXT,
    language                 TEXT NOT NULL DEFAULT 'ar' CHECK(language IN ('ar','en','both')),
    price_min                REAL,
    price_max                REAL,
    human_handoff_threshold  REAL NOT NULL DEFAULT 0.3,
    is_active                INTEGER NOT NULL DEFAULT 1,
    created_at               TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Contacts / CRM
CREATE TABLE IF NOT EXISTS contacts (
    id                TEXT PRIMARY KEY,
    tenant_id         TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name              TEXT,
    phone             TEXT NOT NULL,
    email             TEXT,
    channel           TEXT NOT NULL DEFAULT 'whatsapp' CHECK(channel IN ('whatsapp','instagram','email','web')),
    stage             TEXT NOT NULL DEFAULT 'lead' CHECK(stage IN ('lead','prospect','customer','churned')),
    sentiment_score   REAL NOT NULL DEFAULT 0.5,
    total_spent       REAL NOT NULL DEFAULT 0.0,
    tags              TEXT DEFAULT '[]',
    notes             TEXT,
    assigned_agent_id TEXT REFERENCES ai_agents(id),
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(tenant_id, phone)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id  TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel     TEXT NOT NULL DEFAULT 'whatsapp',
    status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','resolved','human_takeover')),
    agent_id    TEXT REFERENCES ai_agents(id),
    sentiment   REAL NOT NULL DEFAULT 0.5,
    summary     TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id               TEXT PRIMARY KEY,
    conversation_id  TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role             TEXT NOT NULL CHECK(role IN ('user','assistant','human')),
    content          TEXT NOT NULL,
    whatsapp_msg_id  TEXT,
    metadata         TEXT DEFAULT '{}',
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Follow-ups
CREATE TABLE IF NOT EXISTS followups (
    id               TEXT PRIMARY KEY,
    tenant_id        TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id       TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    conversation_id  TEXT REFERENCES conversations(id),
    scheduled_at     TEXT NOT NULL,
    message          TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','cancelled')),
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Subscription events (Stripe webhooks log)
CREATE TABLE IF NOT EXISTS subscription_events (
    id               TEXT PRIMARY KEY,
    tenant_id        TEXT REFERENCES tenants(id) ON DELETE SET NULL,
    event_type       TEXT NOT NULL,
    stripe_event_id  TEXT UNIQUE,
    data             TEXT DEFAULT '{}',
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agents_tenant        ON ai_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant      ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone       ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_followups_tenant      ON followups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled   ON followups(scheduled_at, status);
