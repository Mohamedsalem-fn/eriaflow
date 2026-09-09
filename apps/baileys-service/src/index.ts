// -*- coding: utf-8 -*-
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------
// EriaFlow Baileys WhatsApp Service Gateway & Dashboard
// -------------------------------------------------------------------------------

import crypto from 'node:crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = crypto;
}

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

// Logs Store for Live Dashboard (Keep last 100 logs)
interface LogEntry {
  id: string;
  time: string;
  type: 'incoming' | 'outgoing' | 'system' | 'error';
  msg: string;
}
const systemLogs: LogEntry[] = [];

function addLog(type: LogEntry['type'], msg: string) {
  const entry: LogEntry = {
    id: Math.random().toString(36).substring(2, 9),
    time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type,
    msg,
  };
  systemLogs.unshift(entry);
  if (systemLogs.length > 100) systemLogs.pop();
}

const logger = pino({ level: 'info' });

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  connectionStatus = 'connecting';
  addLog('system', 'بدء الاتصال بالواتساب وجلب التكاليف الحالية...');

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
      addLog('system', 'تم إنتاج رمز QR جديد - يرجى المسح للربط');
    }

    if (connection === 'close') {
      connectionStatus = 'disconnected';
      qrCodeStr = null;
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      const reason = lastDisconnect?.error?.message || 'غير معروف';

      addLog('error', `انقطع الاتصال بالواتساب. السبب: ${reason}`);

      if (shouldReconnect) {
        addLog('system', 'جاري إعادة الاتصال تلقائياً خلال 5 ثوانٍ...');
        setTimeout(connectToWhatsApp, 5000);
      } else {
        addLog('error', 'تم تسجيل الخروج من الجلسة. جاري مسح البيانات القديمة لإتاحة كود جديد...');
        if (fs.existsSync(AUTH_FOLDER)) {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
        }
        setTimeout(connectToWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      connectionStatus = 'connected';
      qrCodeStr = null;
      addLog('system', '✅ تم الاتصال بنجاح بالواتساب! النظام جاهز لاستقبال وإرسال الرسائل');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

      if (!from || !text) continue;

      addLog('incoming', `رسالة واردة من (${from}): ${text}`);

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
                        from: msg.key.remoteJid,
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

        const workerData = await res.json() as any;
        if (workerData?.reply) {
          addLog('system', `تم توليد الرد من الوركر (${res.status}): "${workerData.reply}"`);

          // Send reply directly to WhatsApp
          if (sock && connectionStatus === 'connected') {
            await sock.sendMessage(from, { text: workerData.reply });
            addLog('outgoing', `تم إرسال الرد التلقائي إلى (${from}): ${workerData.reply}`);
          }
        } else {
          addLog('system', `تم توجيه الرسالة للوركر - حالة الاستجابة: ${res.status}`);
        }
      } catch (err: any) {
        addLog('error', `خطأ في تحويل الرسالة إلى Cloudflare Worker: ${err.message}`);
      }
    }
  });
}

// ─── Control APIs ─────────────────────────────────────────────────────────────

app.get('/status', (req: Request, res: Response) => {
  res.json({
    status: connectionStatus,
    qrAvailable: !!qrCodeStr,
    logsCount: systemLogs.length,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/logs', (req: Request, res: Response) => {
  res.json({ logs: systemLogs, status: connectionStatus, qrCodeStr });
});

app.post('/api/logout', async (req: Request, res: Response) => {
  try {
    if (sock) {
      sock.logout();
    }
    if (fs.existsSync(AUTH_FOLDER)) {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    }
    connectionStatus = 'disconnected';
    qrCodeStr = null;
    addLog('system', 'تم تسجيل الخروج يدوياً وإعادة تهيئة الجلسة.');
    setTimeout(connectToWhatsApp, 2000);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/send', async (req: Request, res: Response) => {
  const { to, text } = req.body;

  if (!sock || connectionStatus !== 'connected') {
    addLog('error', `فشل الإرسال إلى (${to}): الواتساب غير متصل حالياً`);
    return res.status(500).json({ error: 'WhatsApp not connected' });
  }

  try {
    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
    addLog('outgoing', `تم إرسال رد إلى (${jid}): ${text}`);
    res.json({ success: true, jid });
  } catch (err: any) {
    addLog('error', `خطأ في إرسال الرسالة إلى (${to}): ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ─── Live Dashboard UI (Rich Web Console) ────────────────────────────────────

app.get('/qr', (req: Request, res: Response) => {
  res.redirect('/');
});

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EriaFlow WhatsApp Baileys Worker Console</title>
      <style>
        :root {
          --bg: #0b0f17;
          --card: #151c28;
          --border: #222e42;
          --primary: #4f46e5;
          --accent: #06b6d4;
          --success: #10b981;
          --danger: #ef4444;
          --warning: #f59e0b;
          --text: #f8fafc;
          --muted: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        body { background: var(--bg); color: var(--text); padding: 1.5rem; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .title { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: 800; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
        .badge-connected { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-disconnected { background: rgba(239, 68, 68, 0.15); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge-connecting { background: rgba(245, 158, 11, 0.15); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
        
        .grid { display: grid; grid-template-columns: 350px 1fr; gap: 1.25rem; }
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; }
        .btn { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-danger { background: var(--danger); color: white; }
        .btn-secondary { background: var(--border); color: var(--text); }
        
        .console { background: #070a0f; border: 1px solid var(--border); border-radius: 10px; height: 500px; overflow-y: auto; padding: 1rem; font-family: monospace; font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px; }
        .log-item { padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.03); border-right: 3px solid var(--border); }
        .log-incoming { border-right-color: var(--accent); color: #67e8f9; }
        .log-outgoing { border-right-color: var(--success); color: #6ee7b7; }
        .log-system { border-right-color: var(--primary); color: #a5b4fc; }
        .log-error { border-right-color: var(--danger); color: #fca5a5; }
        
        .form-input { width: 100%; background: #070a0f; border: 1px solid var(--border); border-radius: 8px; padding: 10px; color: white; margin-bottom: 10px; font-size: 0.85rem; }
        .qr-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; padding: 1rem; border-radius: 12px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">
          <span>⚡ EriaFlow Baileys WhatsApp Gateway Console</span>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <span id="statusBadge" class="badge badge-connecting">جاري الفحص...</span>
          <button onclick="logoutSession()" class="btn btn-danger">قطع الاتصال وتجديد الـ QR</button>
        </div>
      </div>

      <div class="grid">
        <!-- Sidebar Controls -->
        <div>
          <!-- QR Card -->
          <div class="card" style="margin-bottom: 1.25rem;">
            <h3 style="font-size:1rem; margin-bottom:0.5rem;">حالة ارتباط الواتساب</h3>
            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:1rem;">قم بمسح الكود برقم الجوال المخصص للمبيعات أو الدعم</p>
            <div id="qrArea">
              <div style="text-align:center; padding:2rem; color:var(--muted)">جاري تحميل رمز QR...</div>
            </div>
          </div>

          <!-- Test Message Box -->
          <div class="card">
            <h3 style="font-size:1rem; margin-bottom:0.75rem;">اختبار إرسال مباشر</h3>
            <input type="text" id="targetPhone" placeholder="رقم المستقبل (مثال: 966501234567)" class="form-input" />
            <textarea id="testMsg" rows="3" placeholder="نص الرسالة..." class="form-input"></textarea>
            <button onclick="sendTestMessage()" class="btn btn-primary" style="width:100%; justify-content:center;">إرسال رسالة تجريبية 🚀</button>
          </div>
        </div>

        <!-- Live Console Logs -->
        <div class="card" style="display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <h3 style="font-size:1rem;">سجل الأحداث والعمليات الفورية (Live System Logs)</h3>
            <button onclick="fetchLogs()" class="btn btn-secondary" style="padding:4px 10px; font-size:0.75rem;">تحديث الآن 🔄</button>
          </div>
          <div id="consoleBox" class="console">
            <div style="color:var(--muted)">جاري الاتصال بسجل الأحداث...</div>
          </div>
        </div>
      </div>

      <script>
        async function fetchLogs() {
          try {
            const res = await fetch('/api/logs');
            const data = await res.json();

            // Status Badge
            const badge = document.getElementById('statusBadge');
            if (data.status === 'connected') {
              badge.className = 'badge badge-connected';
              badge.innerText = '● متصل ونشط';
            } else if (data.status === 'connecting') {
              badge.className = 'badge badge-connecting';
              badge.innerText = '● جاري الاتصال...';
            } else {
              badge.className = 'badge badge-disconnected';
              badge.innerText = '○ غير متصل';
            }

            // QR Box
            const qrArea = document.getElementById('qrArea');
            if (data.status === 'connected') {
              qrArea.innerHTML = '<div style="background:rgba(16,185,129,0.1); color:#10b981; padding:1rem; border-radius:8px; text-align:center; font-weight:bold;">✅ الجلسة متصلة بالواتساب بنجاح!</div>';
            } else if (data.qrCodeStr) {
              qrArea.innerHTML = \`
                <div class="qr-box">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=\${encodeURIComponent(data.qrCodeStr)}" />
                  <p style="color:#000; font-size:0.75rem; margin-top:8px; font-weight:bold;">امسح الكود عبر الواتساب الان</p>
                </div>
              \`;
            } else {
              qrArea.innerHTML = '<div style="text-align:center; padding:1.5rem; color:var(--muted)">جاري تهيئة رمز الـ QR...</div>';
            }

            // Render Console Logs
            const consoleBox = document.getElementById('consoleBox');
            if (data.logs.length === 0) {
              consoleBox.innerHTML = '<div style="color:var(--muted)">لا توجد أحداث مسجلة بعد...</div>';
            } else {
              consoleBox.innerHTML = data.logs.map(l => \`
                <div class="log-item log-\${l.type}">
                  <span style="opacity:0.6; margin-left:8px;">[\${l.time}]</span>
                  <span>\${l.msg}</span>
                </div>
              \`).join('');
            }
          } catch (e) {
            console.error(e);
          }
        }

        async function logoutSession() {
          if (confirm('هل أنت تأكد من قطع الاتصال وإلغاء الجلسة الحالية؟')) {
            await fetch('/api/logout', { method: 'POST' });
            fetchLogs();
          }
        }

        async function sendTestMessage() {
          const to = document.getElementById('targetPhone').value;
          const text = document.getElementById('testMsg').value;
          if (!to || !text) return alert('يرجى كتابة رقم الهاتف ونص الرسالة');

          const res = await fetch('/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, text })
          });
          const data = await res.json();
          if (data.success) {
            alert('تم إرسال الرسالة بنجاح!');
            document.getElementById('testMsg').value = '';
          } else {
            alert('خطأ: ' + data.error);
          }
          fetchLogs();
        }

        // Auto Poll every 2.5 seconds
        setInterval(fetchLogs, 2500);
        fetchLogs();
      </script>
    </body>
    </html>
  `);
});

// Start Server
app.listen(PORT, () => {
  addLog('system', `[EriaFlow Baileys Gateway] يعمل الآن بنجاح على البورت ${PORT}`);
  connectToWhatsApp();
});
