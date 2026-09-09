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

// All routes require authentication
router.use('*', authMiddleware);

// ─── Schemas ─────────────────────────────────────────────────────────────────
const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['sales', 'support', 'custom']),
  personality: z.string().optional(),
  language: z.enum(['ar', 'en', 'both']).default('ar'),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  humanHandoffThreshold: z.number().min(0).max(1).default(0.3),
});

const updateAgentSchema = createAgentSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ─── GET /agents — List all agents for tenant ─────────────────────────────────
router.get('/', async (c) => {
  const user = c.get('user');

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM ai_agents WHERE tenant_id = ? ORDER BY created_at DESC`
  ).bind(user.tenantId).all();

  return c.json({ success: true, data: results });
});

// ─── POST /agents — Create new agent ─────────────────────────────────────────
router.post('/', zValidator('json', createAgentSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  // Check plan limits
  const { count } = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM ai_agents WHERE tenant_id = ? AND is_active = 1`
  ).bind(user.tenantId).first<{ count: number }>() ?? { count: 0 };

  const tenant = await c.env.DB.prepare(
    `SELECT plan FROM tenants WHERE id = ?`
  ).bind(user.tenantId).first<{ plan: string }>();

  const PLAN_AGENT_LIMITS: Record<string, number> = {
    free: 1, starter: 3, pro: 10, enterprise: Infinity,
  };

  const limit = PLAN_AGENT_LIMITS[tenant?.plan ?? 'free'];
  if (count >= limit) {
    return c.json({ success: false, error: `Your plan allows maximum ${limit} agents. Upgrade to add more.` }, 403);
  }

  const id = nanoid();
  await c.env.DB.prepare(
    `INSERT INTO ai_agents (id, tenant_id, name, type, personality, language, price_min, price_max, human_handoff_threshold)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.tenantId, body.name, body.type,
    body.personality ?? null,
    body.language,
    body.priceMin ?? null,
    body.priceMax ?? null,
    body.humanHandoffThreshold,
  ).run();

  const agent = await c.env.DB.prepare(`SELECT * FROM ai_agents WHERE id = ?`).bind(id).first();

  return c.json({ success: true, data: agent }, 201);
});

// ─── GET /agents/:id — Get single agent ──────────────────────────────────────
router.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const agent = await c.env.DB.prepare(
    `SELECT * FROM ai_agents WHERE id = ? AND tenant_id = ?`
  ).bind(id, user.tenantId).first();

  if (!agent) return c.json({ success: false, error: 'Agent not found' }, 404);

  return c.json({ success: true, data: agent });
});

// ─── PATCH /agents/:id — Update agent ────────────────────────────────────────
router.patch('/:id', zValidator('json', updateAgentSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    `SELECT id FROM ai_agents WHERE id = ? AND tenant_id = ?`
  ).bind(id, user.tenantId).first();

  if (!existing) return c.json({ success: false, error: 'Agent not found' }, 404);

  const fields = Object.entries({
    name: body.name,
    type: body.type,
    personality: body.personality,
    language: body.language,
    price_min: body.priceMin,
    price_max: body.priceMax,
    human_handoff_threshold: body.humanHandoffThreshold,
    is_active: body.isActive !== undefined ? (body.isActive ? 1 : 0) : undefined,
    updated_at: new Date().toISOString(),
  }).filter(([, v]) => v !== undefined);

  const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
  const values = fields.map(([, v]) => v);

  await c.env.DB.prepare(
    `UPDATE ai_agents SET ${setClause} WHERE id = ? AND tenant_id = ?`
  ).bind(...values, id, user.tenantId).run();

  const updated = await c.env.DB.prepare(`SELECT * FROM ai_agents WHERE id = ?`).bind(id).first();

  return c.json({ success: true, data: updated });
});

// ─── DELETE /agents/:id — Delete agent ───────────────────────────────────────
router.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const result = await c.env.DB.prepare(
    `DELETE FROM ai_agents WHERE id = ? AND tenant_id = ?`
  ).bind(id, user.tenantId).run();

  if (!result.meta.changes) return c.json({ success: false, error: 'Agent not found' }, 404);

  return c.json({ success: true, message: 'Agent deleted successfully' });
});

export default router;
