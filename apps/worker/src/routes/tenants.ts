// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';

const router = new Hono<{ Bindings: Env }>();
router.use('*', authMiddleware);

// ─── POST /tenants — Onboarding (create tenant after signup) ─────────────────
const createTenantSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  userId: z.string(),
});

router.post('/', zValidator('json', createTenantSchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    `SELECT id FROM tenants WHERE id = ? OR email = ?`
  ).bind(body.userId, body.email).first();

  if (existing) {
    return c.json({ success: false, error: 'Tenant already exists' }, 409);
  }

  // Create tenant (using Supabase user ID as tenant ID for 1:1 mapping)
  await c.env.DB.prepare(
    `INSERT INTO tenants (id, name, email, plan) VALUES (?, ?, ?, 'free')`
  ).bind(body.userId, body.name, body.email).run();

  // Create default AI agent
  const agentId = nanoid();
  await c.env.DB.prepare(
    `INSERT INTO ai_agents (id, tenant_id, name, type, personality, language)
     VALUES (?, ?, 'مساعد المبيعات', 'sales', ?, 'ar')`
  ).bind(
    agentId,
    body.userId,
    `أنت مساعد مبيعات ذكي لشركة ${body.name}. مهمتك مساعدة العملاء، الإجابة على أسئلتهم، وإغلاق صفقات البيع باحترافية وودية.`,
  ).run();

  const tenant = await c.env.DB.prepare(`SELECT * FROM tenants WHERE id = ?`).bind(body.userId).first();

  return c.json({ success: true, data: tenant }, 201);
});

// ─── GET /tenants/me — Current tenant profile ────────────────────────────────
router.get('/me', async (c) => {
  const user = c.get('user');

  const tenant = await c.env.DB.prepare(
    `SELECT id, name, email, plan, ai_provider, monthly_conversations, created_at FROM tenants WHERE id = ?`
  ).bind(user.tenantId).first();

  if (!tenant) return c.json({ success: false, error: 'Tenant not found' }, 404);

  return c.json({ success: true, data: tenant });
});

// ─── PATCH /tenants/me — Update tenant settings ──────────────────────────────
const updateTenantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  aiProvider: z.enum(['auto', 'openai', 'claude', 'gemini', 'deepseek']).optional(),
  whatsappPhoneId: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
});

router.patch('/me', zValidator('json', updateTenantSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const fieldMap: Record<string, unknown> = {
    name: body.name,
    ai_provider: body.aiProvider,
    whatsapp_phone_id: body.whatsappPhoneId,
    whatsapp_access_token: body.whatsappAccessToken,
    updated_at: new Date().toISOString(),
  };

  const fields = Object.entries(fieldMap).filter(([, v]) => v !== undefined);
  const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
  const values = fields.map(([, v]) => v);

  await c.env.DB.prepare(
    `UPDATE tenants SET ${setClause} WHERE id = ?`
  ).bind(...values, user.tenantId).run();

  const updated = await c.env.DB.prepare(
    `SELECT id, name, email, plan, ai_provider, monthly_conversations FROM tenants WHERE id = ?`
  ).bind(user.tenantId).first();

  return c.json({ success: true, data: updated });
});

export default router;
