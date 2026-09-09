// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';

const router = new Hono<{ Bindings: Env }>();
router.use('*', authMiddleware);

// ─── GET /analytics/overview ──────────────────────────────────────────────────
router.get('/overview', async (c) => {
  const user = c.get('user');

  const [
    convStats,
    contactStats,
    sentimentStats,
    recentConversations,
  ] = await Promise.all([
    // Conversation stats
    c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'human_takeover' THEN 1 ELSE 0 END) as human_takeover,
        SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as this_week,
        SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as this_month
      FROM conversations WHERE tenant_id = ?
    `).bind(user.tenantId).first(),

    // Contact / lead stats
    c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_contacts,
        SUM(CASE WHEN stage = 'lead' THEN 1 ELSE 0 END) as leads,
        SUM(CASE WHEN stage = 'prospect' THEN 1 ELSE 0 END) as prospects,
        SUM(CASE WHEN stage = 'customer' THEN 1 ELSE 0 END) as customers,
        SUM(total_spent) as total_revenue
      FROM contacts WHERE tenant_id = ?
    `).bind(user.tenantId).first(),

    // Sentiment average
    c.env.DB.prepare(`
      SELECT AVG(sentiment) as avg_sentiment
      FROM conversations WHERE tenant_id = ? AND created_at >= datetime('now', '-30 days')
    `).bind(user.tenantId).first(),

    // Recent conversations
    c.env.DB.prepare(`
      SELECT conv.id, conv.status, conv.created_at, cont.name, cont.phone
      FROM conversations conv
      LEFT JOIN contacts cont ON conv.contact_id = cont.id
      WHERE conv.tenant_id = ?
      ORDER BY conv.updated_at DESC LIMIT 5
    `).bind(user.tenantId).all(),
  ]);

  return c.json({
    success: true,
    data: {
      conversations: convStats,
      contacts: contactStats,
      sentiment: sentimentStats,
      recentConversations: recentConversations.results,
    },
  });
});

// ─── GET /analytics/conversations/daily — 30-day chart data ──────────────────
router.get('/conversations/daily', async (c) => {
  const user = c.get('user');

  const { results } = await c.env.DB.prepare(`
    SELECT 
      date(created_at) as date,
      COUNT(*) as count
    FROM conversations
    WHERE tenant_id = ? AND created_at >= datetime('now', '-30 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).bind(user.tenantId).all();

  return c.json({ success: true, data: results });
});

export default router;
