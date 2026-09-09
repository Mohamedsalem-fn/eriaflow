// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env';

// JWT verification using Supabase JWT secret (HS256)
async function verifyJWT(token: string, secret: string): Promise<{ sub: string; email: string; role: string } | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !sigB64) return null;

    // Verify signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);
    if (!valid) return null;

    // Decode payload
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return { sub: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export type AuthUser = {
  userId: string;
  email: string;
  tenantId: string;
};

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.SUPABASE_JWT_SECRET);

  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }

  // Fetch tenant from DB using user's sub (Supabase user ID = tenant ID in our schema)
  const tenant = await c.env.DB.prepare('SELECT id FROM tenants WHERE id = ?').bind(payload.sub).first<{ id: string }>();

  if (!tenant) {
    return c.json({ success: false, error: 'Tenant not found. Please complete onboarding.' }, 403);
  }

  c.set('user', { userId: payload.sub, email: payload.email, tenantId: tenant.id });

  await next();
});
