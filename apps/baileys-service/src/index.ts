// -*- coding: utf-8 -*-
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------
// EriaFlow Baileys WhatsApp Service Gateway
// Connects native WhatsApp sessions directly to EriaFlow Cloudflare Worker API
// -------------------------------------------------------------------------------

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket
} from '@whiskeysockets/baileys';
import express, { Request, Response } from 'express';
import cors from 'cors';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const WORKER_WEBHOOK_URL = process.env.WORKER_WEBHOOK_URL || 'https://eriaflow-worker.mohamedsalem-fn.workers.dev/api/v1/whatsapp';
const AUTH_FOLDER = path.join(__dirname, '../auth_info');

let sock: WASocket | null = null;
let qrCodeStr: string | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

const logger = pino({ level: 'info' });

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  connectionStatus = 'connecting';

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeStr = qr;
      console.log('\n================ WhatsApp QR Code ================');
      qrcode.generate(qr, { small: true });
      console.log('==================================================\n');
    }

    if (connection === 'close') {
      connectionStatus = 'disconnected';
      qrCodeStr = null;
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`[Baileys] Connection closed. Reason: ${lastDisconnect?.error?.message}. Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 5000);
      } else {
        console.log('[Baileys] Session logged out. Clearing auth folder...');
        if (fs.existsSync(AUTH_FOLDER)) {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
        }
        setTimeout(connectToWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      connectionStatus = 'connected';
      qrCodeStr = null;
      console.log('[Baileys] ✅ WhatsApp Connection successfully established!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      if (msg.key.fromMe) continue; // Ignore self messages

      const from = msg.key.remoteJid;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

      if (!from || !text) continue;

      console.log(`[Baileys Incoming] From: ${from} | Text: ${text}`);

      // Forward to Cloudflare Worker EriaFlow AI Engine
      try {
        const payload = {
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'baileys-vps-gateway',
              changes: [
                {
                  field: 'messages',
                  value: {
                    metadata: { phone_number_id: 'baileys-session' },
                    messages: [
                      {
                        id: msg.key.id,
                        from: from.replace('@s.whatsapp.net', ''),
                        type: 'text',
                        text: { body: text },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        };

        const res = await fetch(WORKER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log(`[Baileys Relay] Forwarded to Worker. Status: ${res.status}`);
      } catch (err) {
        console.error('[Baileys Relay Error]', err);
      }
    }
  });
}

// ─── API Routes ───────────────────────────────────────────────────────────────

app.get('/status', (req: Request, res: Response) => {
  res.json({
    status: connectionStatus,
    qrAvailable: !!qrCodeStr,
    timestamp: new Date().toISOString(),
  });
});

app.get('/qr', (req: Request, res: Response) => {
  if (connectionStatus === 'connected') {
    return res.send('<h3>WhatsApp is already connected! ✅</h3>');
  }
  if (!qrCodeStr) {
    return res.send('<h3>Generating QR Code, please refresh in 3 seconds...</h3>');
  }

  res.send(`
    <html>
      <head><title>EriaFlow WhatsApp Pair</title></head>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#0f172a; color:white;">
        <h2>EriaFlow WhatsApp Baileys Pairing</h2>
        <p>Scan this QR code with WhatsApp on your phone:</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeStr)}" alt="QR Code" />
        <p style="margin-top:20px; color:#94a3b8;">Status: ${connectionStatus}</p>
      </body>
    </html>
  `);
});

app.post('/send', async (req: Request, res: Response) => {
  const { to, text } = req.body;

  if (!sock || connectionStatus !== 'connected') {
    return res.status(500).json({ error: 'WhatsApp not connected' });
  }

  try {
    const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
    res.json({ success: true, jid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[EriaFlow Baileys Gateway] Server running on port ${PORT}`);
  connectToWhatsApp();
});
