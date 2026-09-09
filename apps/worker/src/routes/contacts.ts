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

const createContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional(),
  channel: z.enum(['whatsapp', 'instagram', 'email', 'web']).default('whatsapp'),
  stage: z.enum(['lead', 'prospect', 'customer', 'churned']).default('lead'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  assignedAgentId: z.string().optional(),
});

const updateContactSchema = createContactSchema.partial().extend({
  sentimentScore: z.number().min(0).max(1).optional(),
  totalSpent: z.number().min(0).optional(),
});

// ─── GET /contacts ────────────────────────────────────────────────────────────
router.get('/', async (c) => {
  const user = c.get('user');
  const { page = '1', limit = '20', stage, search } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);
  let query = `SELECT * FROM contacts WHERE tenant_id = ?`;
  const params: unknown[] = [user.tenantId];

  if (stage) { query += ` AND stage = ?`; params.push(stage); }
  if (search) { query += ` AND (name LIKE ? OR phone LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  const { count } = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM contacts WHERE tenant_id = ?`
  ).bind(user.tenantId).first<{ count: number }>() ?? { count: 0 };

  return c.json({
    success: true,
    data: results,
    meta: { total: count, page: parseInt(page), limit: parseInt(limit) },
  });
});

// ─── POST /contacts ───────────────────────────────────────────────────────────
router.post('/', zValidator('json', createContactSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const id = nanoid();
  try {
    await c.env.DB.prepare(
      `INSERT INTO contacts (id, tenant_id, name, phone, email, channel, stage, tags, notes, assigned_agent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, user.tenantId, body.name ?? null, body.phone,
      body.email ?? null, body.channel, body.stage,
      JSON.stringify(body.tags), body.notes ?? null,
      body.assignedAgentId ?? null,
    ).run();
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      return c.json({ success: false, error: 'Contact with this phone number already exists' }, 409);
    }
    throw e;
  }

  const contact = await c.env.DB.prepare(`SELECT * FROM contacts WHERE id = ?`).bind(id).first();
  return c.json({ success: true, data: contact }, 201);
});

// ─── GET /contacts/:id ────────────────────────────────────────────────────────
router.get('/:id', async (c) => {
  const user = c.get('user');
  const contact = await c.env.DB.prepare(
    `SELECT * FROM contacts WHERE id = ? AND tenant_id = ?`
  ).bind(c.req.param('id'), user.tenantId).first();

  if (!contact) return c.json({ success: false, error: 'Contact not found' }, 404);
  return c.json({ success: true, data: contact });
});

// ─── PATCH /contacts/:id ──────────────────────────────────────────────────────
router.patch('/:id', zValidator('json', updateContactSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    `SELECT id FROM contacts WHERE id = ? AND tenant_id = ?`
  ).bind(id, user.tenantId).first();

  if (!existing) return c.json({ success: false, error: 'Contact not found' }, 404);

  const fieldMap: Record<string, unknown> = {
    name: body.name,
    phone: body.phone,
    email: body.email,
    channel: body.channel,
    stage: body.stage,
    tags: body.tags ? JSON.stringify(body.tags) : undefined,
    notes: body.notes,
    sentiment_score: body.sentimentScore,
    total_spent: body.totalSpent,
    assigned_agent_id: body.assignedAgentId,
    updated_at: new Date().toISOString(),
  };

  const fields = Object.entries(fieldMap).filter(([, v]) => v !== undefined);
  const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
  const values = fields.map(([, v]) => v);

  await c.env.DB.prepare(
    `UPDATE contacts SET ${setClause} WHERE id = ? AND tenant_id = ?`
  ).bind(...values, id, user.tenantId).run();

  const updated = await c.env.DB.prepare(`SELECT * FROM contacts WHERE id = ?`).bind(id).first();
  return c.json({ success: true, data: updated });
});

// ─── DELETE /contacts/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (c) => {
  const user = c.get('user');
  const result = await c.env.DB.prepare(
    `DELETE FROM contacts WHERE id = ? AND tenant_id = ?`
  ).bind(c.req.param('id'), user.tenantId).run();

  if (!result.meta.changes) return c.json({ success: false, error: 'Contact not found' }, 404);
  return c.json({ success: true, message: 'Contact deleted successfully' });
});

export default router;
