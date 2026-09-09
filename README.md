# EriaFlow — AI-Powered Sales & Customer Service Automation SaaS

<div align="center">
  <h3>🤖 Automate. Sell. Scale. 24/7</h3>
  <p>An intelligent SaaS platform that automates customer service and sales for SMBs via AI agents on WhatsApp and other channels.</p>
</div>

---

## 🚀 Overview

EriaFlow connects AI agents to your business communication channels (WhatsApp, Email, Instagram DM) and operates as a fully autonomous sales & support representative:
- Understands customer intent using LLMs (multi-provider: OpenAI, Claude, Gemini, DeepSeek)
- Negotiates within defined price limits
- Logs leads & conversations to a built-in CRM
- Sends payment links via Stripe
- Follows up automatically with unconverted leads

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                  EriaFlow SaaS Platform                │
│                                                        │
│  Next.js 15 (Frontend) ──► Cloudflare Pages            │
│  Hono.js (Backend)     ──► Cloudflare Workers          │
│  Cloudflare D1         ──► SQLite at the Edge          │
│  Supabase              ──► Auth + Realtime             │
│  WhatsApp Cloud API    ──► Meta Official               │
│  Multi-LLM Router      ──► DeepSeek/Gemini/OpenAI/Claude│
└────────────────────────────────────────────────────────┘
```

## 📦 Monorepo Structure

```
eriaflow/
├── apps/
│   ├── web/        # Next.js 15 Frontend + Dashboard
│   └── worker/     # Cloudflare Worker API (Hono.js)
├── packages/
│   └── shared/     # Shared types & utilities
├── docs/           # Project documentation
└── .github/        # CI/CD workflows
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS v4, shadcn/ui |
| Backend | Cloudflare Workers, Hono.js, TypeScript |
| Database | Cloudflare D1 (SQLite), Supabase |
| Auth | Supabase Auth |
| AI | Multi-Provider Router (DeepSeek, Gemini, OpenAI, Claude) |
| Messaging | Meta WhatsApp Cloud API |
| Payments | Stripe |
| Hosting | Cloudflare Pages + Workers |

## ⚡ Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Cloudflare account
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/MohamedSalem/eriaflow.git
cd eriaflow

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/worker/.env.example apps/worker/.env

# Start development servers
pnpm dev
```

### Environment Variables

#### `apps/web/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://api.eriaflow.workers.dev
```

#### `apps/worker/.env`
```env
SUPABASE_JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
DEEPSEEK_API_KEY=your_deepseek_key
WHATSAPP_VERIFY_TOKEN=your_verify_token
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 📋 Development Roadmap

- [x] Phase 1: Monorepo setup, Auth, Database schema
- [ ] Phase 2: AI Core (Multi-provider router) + Landing Page
- [ ] Phase 3: WhatsApp Integration (MVP)
- [ ] Phase 4: Full Dashboard + CRM + Analytics

## 💰 Pricing Plans

| Plan | Price | Conversations/mo | AI Agents |
|------|-------|-----------------|-----------|
| Free | $0 | 100 | 1 |
| Starter | $49 | 1,000 | 3 |
| Pro | $149 | 5,000 | 10 |
| Enterprise | Custom | Unlimited | Unlimited |

## 📄 License

Copyright (c) 2026. All Rights Reserved.

---

## 👤 Author

**Mohamed Salem**  
Expert AI Engineer & Automation Architect  
Focus: AI Engineering | Automation | Agentic Systems | LLMs | MLOps

> 2+ years in software development | 1 year specialized in AI Engineering
