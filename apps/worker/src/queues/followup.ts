// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import type { MessageBatch } from '@cloudflare/workers-types';
import type { Env } from '../types/env';

interface FollowupMessage {
  followupId: string;
  tenantId: string;
  contactId: string;
  toPhone: string;
  message: string;
  phoneNumberId: string;
}

// ─── Queue Consumer ───────────────────────────────────────────────────────────
export async function handleFollowupQueue(batch: MessageBatch<FollowupMessage>, env: Env): Promise<void> {
  for (const msg of batch.messages) {
    try {
      const { followupId, toPhone, message, phoneNumberId } = msg.body;

      // Send WhatsApp message
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: toPhone,
            type: 'text',
            text: { body: message },
          }),
        }
      );

      if (response.ok) {
        // Mark followup as sent
        await env.DB.prepare(
          `UPDATE followups SET status = 'sent' WHERE id = ?`
        ).bind(followupId).run();
        console.log(`[Followup Queue] Sent followup ${followupId} to ${toPhone}`);
        msg.ack();
      } else {
        const errText = await response.text();
        console.error(`[Followup Queue] Failed to send ${followupId}: ${errText}`);
        msg.retry();
      }
    } catch (err) {
      console.error('[Followup Queue Error]', err);
      msg.retry();
    }
  }
}
