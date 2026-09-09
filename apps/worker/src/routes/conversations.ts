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

// ─── GET /conversations ───────────────────────────────────────────────────────
router.get('/', async (c) => {
  const user = c.get('user');
  const { page = '1', limit = '20', status } = c.req.query();
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      conv.*,
      cont.name as contact_name, cont.phone as contact_phone,
      (SELECT content FROM messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1) as last_message_at
    FROM conversations conv
    LEFT JOIN contacts cont ON conv.contact_id = cont.id
    WHERE conv.tenant_id = ?`;

  const params: unknown[] = [user.tenantId];

  if (status) { query += ` AND conv.status = ?`; params.push(status); }

  query += ` ORDER BY conv.updated_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ success: true, data: results });
});

// ─── GET /conversations/:id/messages ─────────────────────────────────────────
router.get('/:id/messages', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const conv = await c.env.DB.prepare(
    `SELECT id FROM conversations WHERE id = ? AND tenant_id = ?`
  ).bind(id, user.tenantId).first();

  if (!conv) return c.json({ success: false, error: 'Conversation not found' }, 404);

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`
  ).bind(id).all();

  return c.json({ success: true, data: results });
});

// ─── POST /conversations/:id/messages — Human sends message ──────────────────
const sendMessageSchema = z.object({
  content: z.string().min(1).max(4096),
});

router.post('/:id/messages', zValidator('json', sendMessageSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { content } = c.req.valid('json');

  const conv = await c.env.DB.prepare(
    `SELECT * FROM conversations WHERE id = ? AND tenant_id = ?`
  ).bind(id, user.tenantId).first<{ contact_id: string; channel: string }>();

  if (!conv) return c.json({ success: false, error: 'Conversation not found' }, 404);

  // Save message
  const msgId = nanoid();
  await c.env.DB.prepare(
    `INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, 'human', ?)`
  ).bind(msgId, id, content).run();

  // Update conversation timestamp
  await c.env.DB.prepare(
    `UPDATE conversations SET updated_at = ? WHERE id = ?`
  ).bind(new Date().toISOString(), id).run();

  // TODO: Send to WhatsApp API (will be implemented in Phase 3)

  return c.json({ success: true, data: { id: msgId, role: 'human', content } }, 201);
});

// ─── PATCH /conversations/:id/takeover — Human takeover ──────────────────────
router.patch('/:id/takeover', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const result = await c.env.DB.prepare(
    `UPDATE conversations SET status = 'human_takeover', updated_at = ? WHERE id = ? AND tenant_id = ?`
  ).bind(new Date().toISOString(), id, user.tenantId).run();

  if (!result.meta.changes) return c.json({ success: false, error: 'Conversation not found' }, 404);

  return c.json({ success: true, message: 'Human takeover activated. AI responses paused.' });
});

// ─── PATCH /conversations/:id/resolve ────────────────────────────────────────
router.patch('/:id/resolve', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const result = await c.env.DB.prepare(
    `UPDATE conversations SET status = 'resolved', updated_at = ? WHERE id = ? AND tenant_id = ?`
  ).bind(new Date().toISOString(), id, user.tenantId).run();

  if (!result.meta.changes) return c.json({ success: false, error: 'Conversation not found' }, 404);

  return c.json({ success: true, message: 'Conversation resolved.' });
});

export default router;
