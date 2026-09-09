// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './types/env';

// Route imports
import agentsRouter    from './routes/agents';
import contactsRouter  from './routes/contacts';
import conversationsRouter from './routes/conversations';
import whatsappRouter  from './routes/whatsapp';
import analyticsRouter from './routes/analytics';
import billingRouter   from './routes/billing';
import tenantsRouter   from './routes/tenants';

// Queue consumer
import { handleFollowupQueue } from './queues/followup';

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = new Hono<{ Bindings: Env }>();

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());

app.use('*', async (c, next) => {
  return cors({
    origin: c.env.CORS_ORIGIN,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(c, next);
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (c) => {
  return c.json({
    app: 'EriaFlow API',
    version: c.env.API_VERSION,
    status: 'operational',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => c.json({ status: 'ok', ts: Date.now() }));

// ─── API Routes ──────────────────────────────────────────────────────────────
const api = new Hono<{ Bindings: Env }>();

api.route('/tenants',       tenantsRouter);
api.route('/agents',        agentsRouter);
api.route('/contacts',      contactsRouter);
api.route('/conversations', conversationsRouter);
api.route('/analytics',     analyticsRouter);
api.route('/billing',       billingRouter);

// Public webhook routes (no auth)
app.route('/webhooks/whatsapp', whatsappRouter);
app.route('/api/v1/whatsapp', whatsappRouter);

// Mount API
app.route('/api/v1', api);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.notFound((c) => {
  return c.json({ success: false, error: 'Route not found' }, 404);
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('[EriaFlow Worker Error]', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

// ─── Default Export (Worker + Queue Consumer) ─────────────────────────────────
export default {
  fetch: app.fetch,
  queue: handleFollowupQueue,
};
