// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';

const router = new Hono<{ Bindings: Env }>();

// Stripe webhook route must be public (no auth middleware)
// Other routes require auth
const protectedRouter = new Hono<{ Bindings: Env }>();
protectedRouter.use('*', authMiddleware);

// ─── GET /billing/plans — List available plans ────────────────────────────────
protectedRouter.get('/plans', (c) => {
  return c.json({
    success: true,
    data: [
      { id: 'free',    name: 'Free',       price: 0,   conversations: 100,     agents: 1  },
      { id: 'starter', name: 'Starter',    price: 49,  conversations: 1000,    agents: 3  },
      { id: 'pro',     name: 'Pro',        price: 149, conversations: 5000,    agents: 10 },
      { id: 'enterprise', name: 'Enterprise', price: null, conversations: null, agents: null },
    ],
  });
});

// ─── GET /billing/usage — Current month usage ─────────────────────────────────
protectedRouter.get('/usage', async (c) => {
  const user = c.get('user');

  const tenant = await c.env.DB.prepare(
    `SELECT plan, monthly_conversations FROM tenants WHERE id = ?`
  ).bind(user.tenantId).first<{ plan: string; monthly_conversations: number }>();

  const LIMITS: Record<string, number> = { free: 100, starter: 1000, pro: 5000, enterprise: -1 };
  const limit = LIMITS[tenant?.plan ?? 'free'];

  return c.json({
    success: true,
    data: {
      plan: tenant?.plan,
      used: tenant?.monthly_conversations ?? 0,
      limit,
      percentage: limit > 0 ? Math.round(((tenant?.monthly_conversations ?? 0) / limit) * 100) : 0,
    },
  });
});

// ─── POST /billing/stripe-webhook — Stripe events ────────────────────────────
const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({ object: z.record(z.unknown()) }),
});

router.post('/stripe-webhook', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) return c.json({ error: 'Missing signature' }, 400);

  // TODO: Verify Stripe signature (implement in Phase 4)
  const event = await c.req.json();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const plan = sub.items?.data?.[0]?.price?.nickname?.toLowerCase() ?? 'free';

      await c.env.DB.prepare(
        `UPDATE tenants SET plan = ?, stripe_subscription_id = ?, updated_at = ?
         WHERE stripe_customer_id = ?`
      ).bind(plan, sub.id, new Date().toISOString(), sub.customer).run();
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await c.env.DB.prepare(
        `UPDATE tenants SET plan = 'free', stripe_subscription_id = NULL, updated_at = ?
         WHERE stripe_customer_id = ?`
      ).bind(new Date().toISOString(), sub.customer).run();
      break;
    }
  }

  return c.json({ received: true });
});

// Mount protected routes
router.route('/', protectedRouter);

export default router;
