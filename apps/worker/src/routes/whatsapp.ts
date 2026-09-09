// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------
// WhatsApp Cloud API Webhook Handler
// Handles: verification challenge + incoming message processing
// -------------------------------------------------------------------------------

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../types/env';
import { routeAI } from '../ai/router';

const router = new Hono<{ Bindings: Env }>();

// ─── GET /webhooks/whatsapp — Verification ────────────────────────────────────
router.get('/', (c) => {
  const mode      = c.req.query('hub.mode');
  const token     = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  if (mode === 'subscribe' && token === c.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verified');
    return c.text(challenge ?? '', 200);
  }

  return c.text('Forbidden', 403);
});

// ─── POST /webhooks/whatsapp — Incoming Messages ──────────────────────────────
router.post('/', async (c) => {
  const body = await c.req.json<WhatsAppWebhookPayload>();

  // Process message and return reply inline
  const result = await processWhatsAppMessage(c.env, body);

  return c.json({
    status: 'ok',
    reply: result?.reply || null,
    contact: result?.fromPhone || null,
    processed: !!result,
  }, 200);
});

// ─── Message Processing ───────────────────────────────────────────────────────
async function processWhatsAppMessage(env: Env, payload: WhatsAppWebhookPayload) {
  try {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    if (change?.field !== 'messages') return;

    const messageData = change.value;
    const incomingMsg = messageData?.messages?.[0];
    if (!incomingMsg || incomingMsg.type !== 'text') return;

    const phoneNumberId = messageData.metadata?.phone_number_id;
    const fromPhone     = incomingMsg.from;
    const msgText       = incomingMsg.text?.body ?? '';
    const whatsappMsgId = incomingMsg.id;

    // Find tenant by WhatsApp phone number ID (or fallback to first tenant)
    let tenant = await env.DB.prepare(
      `SELECT id, plan, ai_provider, monthly_conversations FROM tenants WHERE whatsapp_phone_id = ?`
    ).bind(phoneNumberId).first<{
      id: string; plan: string; ai_provider: string; monthly_conversations: number;
    }>();

    if (!tenant) {
      tenant = await env.DB.prepare(
        `SELECT id, plan, ai_provider, monthly_conversations FROM tenants LIMIT 1`
      ).first<{
        id: string; plan: string; ai_provider: string; monthly_conversations: number;
      }>();
    }

    if (!tenant) {
      console.warn(`[WhatsApp] No tenant found for phone_number_id: ${phoneNumberId}`);
      return;
    }

    // Check monthly conversation limit
    const LIMITS: Record<string, number> = { free: 100, starter: 1000, pro: 5000, enterprise: Infinity };
    if (tenant.monthly_conversations >= (LIMITS[tenant.plan] ?? 100)) {
      console.warn(`[WhatsApp] Tenant ${tenant.id} exceeded monthly conversation limit`);
      return;
    }

    // Find or create contact
    let contact = await env.DB.prepare(
      `SELECT * FROM contacts WHERE tenant_id = ? AND phone = ?`
    ).bind(tenant.id, fromPhone).first<{ id: string; name: string }>();

    if (!contact) {
      const contactId = nanoid();
      await env.DB.prepare(
        `INSERT INTO contacts (id, tenant_id, phone, channel, stage) VALUES (?, ?, ?, 'whatsapp', 'lead')`
      ).bind(contactId, tenant.id, fromPhone).run();
      contact = { id: contactId, name: fromPhone };
    }

    // Find active conversation or create new one
    let conversation = await env.DB.prepare(
      `SELECT * FROM conversations WHERE contact_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`
    ).bind(contact.id).first<{ id: string; status: string }>();

    if (!conversation) {
      const convId = nanoid();

      // Get default active agent
      const agent = await env.DB.prepare(
        `SELECT id FROM ai_agents WHERE tenant_id = ? AND is_active = 1 ORDER BY created_at ASC LIMIT 1`
      ).bind(tenant.id).first<{ id: string }>();

      await env.DB.prepare(
        `INSERT INTO conversations (id, tenant_id, contact_id, channel, agent_id) VALUES (?, ?, ?, 'whatsapp', ?)`
      ).bind(convId, tenant.id, contact.id, agent?.id ?? null).run();

      // Increment monthly conversation counter
      await env.DB.prepare(
        `UPDATE tenants SET monthly_conversations = monthly_conversations + 1 WHERE id = ?`
      ).bind(tenant.id).run();

      conversation = { id: convId, status: 'active' };
    }

    // If human takeover is active, don't respond with AI
    if (conversation.status === 'human_takeover') return;

    // Save incoming message
    await env.DB.prepare(
      `INSERT INTO messages (id, conversation_id, role, content, whatsapp_msg_id) VALUES (?, ?, 'user', ?, ?)`
    ).bind(nanoid(), conversation.id, msgText, whatsappMsgId).run();

    // Get conversation history (last 20 messages)
    const { results: history } = await env.DB.prepare(
      `SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 20`
    ).bind(conversation.id).all<{ role: string; content: string }>();

    // Get agent config
    const agentConfig = await env.DB.prepare(
      `SELECT * FROM ai_agents WHERE tenant_id = ? AND is_active = 1 ORDER BY created_at ASC LIMIT 1`
    ).bind(tenant.id).first<{
      personality: string; language: string; price_min: number; price_max: number;
    }>();

    // Route to AI and get reply
    let aiReply = await routeAI({
      env,
      tenantId: tenant.id,
      preferredProvider: (tenant.ai_provider || 'auto') as string,
      messages: history.reverse(),
      systemPrompt: agentConfig?.personality ?? 'أنت وكيل مبيعات متخصص ومحترف لمنصة EriaFlow. أجب بشكل ودود ومختصر باللغة العربية.',
      language: (agentConfig?.language ?? 'ar') as 'ar' | 'en' | 'both',
    });

    if (!aiReply) {
      console.warn('[WhatsApp] AI Provider fallback triggered - using Sales Agent Knowledge Engine');
      const lower = msgText.toLowerCase();
      if (lower.includes('سعر') || lower.includes('اسعار') || lower.includes('باقة') || lower.includes('باقات') || lower.includes('بكام') || lower.includes('تكلفة')) {
        aiReply = 'أهلاً بك! نوفر في EriaFlow باقتين رئيسيتين:\n1. باقة البداية Starter بسعر $49/شهرياً (1,000 محادثة + وكيل ذكي).\n2. الباقة الاحترافية Pro بسعر $129/شهرياً (5,000 محادثة + 3 وكلاء + Multi-Provider AI).\nهل تود تجربة الباقة الاحترافية مجاناً؟';
      } else if (lower.includes('اسم') || lower.includes('من انت') || lower.includes('مين')) {
        aiReply = 'أهلاً بك! أنا وكيل المبيعات الآلي المباشر لـ EriaFlow. أساعدك في إجابة استفساراتك وأتمتة محادثات عملائك 24/7.';
      } else if (lower.includes('بيع') || lower.includes('بتبيع') || lower.includes('خدمات') || lower.includes('عايز')) {
        aiReply = 'منصة EriaFlow هي نظام SaaS متكامل لأتمتة المبيعات وخدمة العملاء بالذكاء الاصطناعي عبر الواتساب والانستغرام، مع CRM آلي وربط مع نماذج (DeepSeek, OpenAI, Gemini).';
      } else {
        aiReply = 'أهلاً وسهلاً بك! كيف يمكنني مساعدتك اليوم في تنمية مبيعاتك وأتمتة خدمة عملاء مشروعك عبر EriaFlow؟';
      }
    }

    // Save AI reply to messages
    await env.DB.prepare(
      `INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, 'assistant', ?)`
    ).bind(nanoid(), conversation.id, aiReply).run();

    // Update conversation timestamp
    await env.DB.prepare(
      `UPDATE conversations SET updated_at = ? WHERE id = ?`
    ).bind(new Date().toISOString(), conversation.id).run();

    // Send reply via WhatsApp API
    await sendWhatsAppMessage(env, phoneNumberId, fromPhone, aiReply);

    return { reply: aiReply, fromPhone };

  } catch (err) {
    console.error('[WhatsApp Processor Error]', err);
    return null;
  }
}

// ─── WhatsApp Message Sender ──────────────────────────────────────────────────
async function sendWhatsAppMessage(env: Env, phoneNumberId: string, to: string, text: string) {
  if (phoneNumberId === 'baileys-session') {
    // Send via VPS Baileys Gateway
    try {
      await fetch('http://173.230.133.114:3001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, text }),
      });
      console.log(`[Baileys Outgoing] Sent message to ${to}`);
    } catch (err) {
      console.error('[Baileys Outgoing Error]', err);
    }
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[WhatsApp Send Error]', error);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        metadata: { phone_number_id: string };
        messages?: Array<{
          id: string;
          from: string;
          type: string;
          text?: { body: string };
        }>;
      };
    }>;
  }>;
}

export default router;
