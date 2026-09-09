'use client';
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { useState } from 'react';
import { Bot, Save, Sparkles, Sliders, Shield, Zap, Layers, RefreshCw } from 'lucide-react';

export default function AgentsPage() {
  const [preferredProvider, setPreferredProvider] = useState('auto');
  const [salesPrompt, setSalesPrompt] = useState(
    'أنت وكيل مبيعات متخصص لمنصة EriaFlow. أجب بتودد واحترافية باللغة العربية الفصحى. ركز على إظهار القيمة المضافة لأتمتة المبيعات والرد التلقائي عبر الواتساب.'
  );
  const [supportPrompt, setSupportPrompt] = useState(
    'أنت وكيل دعم فني منصة EriaFlow. ساعد العملاء في حل أي مشاكل تقنية واستخدم خطوات بسيطة ومباشرة.'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-content" style={{ maxWidth: '900px' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            إعدادات وكلاء الذكاء الاصطناعي (AI Agents)
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            تخصيص المزودات (AI Router)، توجيه البرومبت، وقواعد الرد الآلي
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary" style={{ gap: '6px' }}>
          <Save size={16} /> حفظ التغييرات
        </button>
      </div>

      {saved && (
        <div style={{ padding: '0.875rem 1.25rem', background: 'var(--color-success)15', border: '1px solid var(--color-success)30', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
          ✓ تم حفظ إعدادات الوكيل بنجاح وتحديث الـ Multi-Provider AI Router على الكلاود!
        </div>
      )}

      {/* Provider Selector Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--color-accent)" /> موجه الذكاء الاصطناعي الذكي (Multi-Provider AI Router)
        </h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          يقوم النظام تلقائياً بتحديد المزود الأسرع والأقل تكلفة مع التبديل التلقائي في حالة حدوث أي ضغط أو انقطاع (Fallback).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { id: 'auto', title: 'تلقائي (مستحسن)', desc: 'Eria Gateway ← DeepSeek ← Gemini ← OpenAI', badge: 'Auto Fallback' },
            { id: 'eria', title: 'Eria Gateway (مجاني)', desc: 'موجه مجاني فائق السرعة GPT-4o Mini', badge: 'أقل تكلفة' },
            { id: 'openai', title: 'OpenAI Direct', desc: 'استخدام مفتاح OpenAI الخاص بك مباشرة', badge: 'GPT-4o' },
          ].map(p => (
            <div
              key={p.id}
              onClick={() => setPreferredProvider(p.id)}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: preferredProvider === p.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: preferredProvider === p.id ? 'var(--color-surface)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.title}</span>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{p.badge}</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prompts Engineering Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--color-primary-light)" /> هندسة البرومبت وكيل المبيعات (Sales Agent)
        </h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          التعليمات الصارمة التي سيتعامل بها الوكيل مع عملاء الواتساب والانستغرام
        </p>

        <textarea
          value={salesPrompt}
          onChange={(e) => setSalesPrompt(e.target.value)}
          className="form-input"
          rows={4}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: '1.6', padding: '0.75rem' }}
        />
      </div>

      {/* Support Agent Prompt */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--color-success)" /> برومبت وكيل الدعم الفني (Support Agent)
        </h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          توجيهات حل المشكلات التقنية وتفعيل الحسابات
        </p>

        <textarea
          value={supportPrompt}
          onChange={(e) => setSupportPrompt(e.target.value)}
          className="form-input"
          rows={4}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: '1.6', padding: '0.75rem' }}
        />
      </div>
    </div>
  );
}
