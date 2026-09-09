'use client';
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { useState } from 'react';
import { CreditCard, Check, Zap, ShieldCheck, ArrowLeftRight, ExternalLink } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'باقة البداية (Starter)',
    price: '$49',
    period: '/ شهرياً',
    messages: '1,000 محادثة / شهر',
    agents: '1 وكيل ذكاء اصطناعي',
    channels: 'WhatsApp Cloud API',
    features: ['ربط رقم واتساب واحد', 'تفاعل آلي 24/7', 'CRM أساسي', 'دعم عبر البريد الإلكتروني'],
    current: false,
  },
  {
    id: 'pro',
    name: 'الباقة الاحترافية (Pro)',
    price: '$129',
    period: '/ شهرياً',
    messages: '5,000 محادثة / شهر',
    agents: '3 وكلاء ذكاء اصطناعي',
    channels: 'WhatsApp + Instagram + Web',
    features: ['ربط 3 ارقام واتساب', 'Multi-Provider AI Router (DeepSeek/Gemini)', 'CRM متقدم مع Score تلقائي', 'تحويل العميل للبشر (Human Handoff)', 'تقارير أسبوعية تفصيلية'],
    current: true,
  },
  {
    id: 'enterprise',
    name: 'باقة الشركات (Enterprise)',
    price: '$299',
    period: '/ شهرياً',
    messages: 'محادثات غير محدودة',
    agents: 'وكلاء غير محدودين',
    channels: 'جميع القنوات + API خفي',
    features: ['دعم مخصص مع خبير ذكاء اصطناعي', 'Custom Prompt Engineering & Fine-tuning', 'سيرفر مستقل بدعم SLAs', 'تكامل مباشر مع أنظمة ERP الخاصة'],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="page-content" style={{ maxWidth: '1000px' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            الاشتراك والفوترة (Billing & Subscription)
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            إدارة خطة اشتراكك عبر Stripe ورفع حد المحادثات والوكلاء النشطين
          </p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          ✓ خطتك الحالية: الباقة الاحترافية (نشط)
        </span>
      </div>

      {/* Current Usage Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg-subtle) 100%)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>الاستهلاك الحالي لهذا الشهر</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>المحادثات المستهلكة</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>342 / 5,000</div>
            <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: '7%', height: '100%', background: 'var(--color-primary)' }} />
            </div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>الوكلاء النشطون</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>3 / 3 وكلاء</div>
            <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--color-success)' }} />
            </div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>تاريخ التجديد القادم</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>1 أكتوبر 2026</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '4px' }}>تجديد تلقائي عبر Stripe</div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              border: plan.current ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              position: 'relative',
            }}
          >
            {plan.current && (
              <span style={{ position: 'absolute', top: '-12px', right: '16px', background: 'var(--color-primary)', color: 'white', fontSize: '0.7rem', padding: '2px 10px', borderRadius: '10px', fontWeight: 700 }}>
                خطة حسابك الحالية
              </span>
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)' }}>{plan.price}</span>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>{plan.period}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1rem 0', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div><b>{plan.messages}</b></div>
              <div><b>{plan.agents}</b></div>
              <div className="text-muted">{plan.channels}</div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {plan.features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                  <Check size={14} color="var(--color-success)" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button className={`btn ${plan.current ? 'btn-outline-primary' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }}>
              {plan.current ? 'إدارة الاشتراك عبر Stripe' : 'ترقية الخطّة الان'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
