'use client';
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, MessageSquare, Bot, Users, ShieldCheck, ArrowRight,
  Sparkles, CheckCircle2, TrendingUp, Cpu, Globe2, PhoneCall
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'وكلاء ذكاء اصطناعي موجهون (AI Agents)',
    desc: 'وكلاء مبيعات ودعم فني يفهمون سياق عملك، يتواصلون باللغة العربية الفصحى أو العامية، ويغلقون الصفقات تلقائياً.',
  },
  {
    icon: MessageSquare,
    title: 'ربط مباشر بـ WhatsApp Cloud API',
    desc: 'تفاعل لحظي 24/7 مع العملاء عبر القناة الأكثر استخداماً بدون حظر أو انقطاع.',
  },
  {
    icon: Cpu,
    title: 'Multi-Provider AI Router',
    desc: 'تبديل تلقائي بين أسرع وأحدث النماذج العالمية (DeepSeek, Gemini 2.0, GPT-4o) لضمان الاستمرارية وأقل تكلفة.',
  },
  {
    icon: Users,
    title: 'CRM آلي وتصنيف مباشر',
    desc: 'إنشاء جهات الاتصال، وتتبع المراحل، وتقييم مدى جاهزية العميل للشراء (Lead Scoring) آلياً.',
  },
  {
    icon: ArrowRight,
    title: 'التدخل البشري اللحظي (Human Handoff)',
    desc: 'إمكانية سحب المحادثة من الذكاء الاصطناعي بنقرة واحدة عند طلب العميل التحدث مع موظف.',
  },
  {
    icon: ShieldCheck,
    title: 'أمان عالي واستقرار بنسبة 99.9%',
    desc: 'بنية تحتية موزعة عالمياً على شبكة Cloudflare Edge لمطابقة أعلى معايير الحماية والأداء.',
  },
];

const PRICING = [
  {
    name: 'باقة البداية (Starter)',
    price: '$49',
    period: '/شهرياً',
    badge: 'للمتاجر والأفراد',
    features: ['1,000 محادثة / شهر', '1 وكيل ذكاء اصطناعي', 'ربط رقم واتساب واحد', 'CRM تلقائي', 'دعم الفني عبر الإيميل'],
    cta: 'ابدأ التجربة المجانية',
    highlight: false,
  },
  {
    name: 'الباقة الاحترافية (Pro)',
    price: '$129',
    period: '/شهرياً',
    badge: 'الأكثر شعبية 🔥',
    features: ['5,000 محادثة / شهر', '3 وكلاء ذكاء اصطناعي', 'ربط 3 أرقام واتساب + انستغرام', 'Multi-Provider AI Router', 'Human Handoff محرك', 'تقارير وتحليلات متقدمة'],
    cta: 'اشترك الان',
    highlight: true,
  },
  {
    name: 'باقة الشركات (Enterprise)',
    price: '$299',
    period: '/شهرياً',
    badge: 'للشركات والمؤسسات',
    features: ['محادثات غير محدودة', 'وكلاء غير محدودين', 'تخصيص كامل للبرومبت والنموذج', 'سيرفر مستقل بدعم SLAs', 'دعم مخصص 24/7'],
    cta: 'تواصل معنا',
    highlight: false,
  },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('animejs').then(({ animate, stagger }) => {
        // Hero entrance
        animate('.hero-element', {
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 800,
          delay: stagger(100),
          ease: 'outExpo',
        });

        // Feature cards staggered reveal
        animate('.feature-card', {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 700,
          delay: stagger(80, { start: 400 }),
          ease: 'outExpo',
        });
      });
    }
  }, []);

  return (
    <div ref={containerRef} style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <header style={{ borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10, 12, 16, 0.8)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="gradient-text">EriaFlow</span>
          </div>

          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
            <a href="#features" className="text-muted" style={{ transition: 'color 0.2s' }}>المميزات</a>
            <a href="#pricing" className="text-muted" style={{ transition: 'color 0.2s' }}>الأسعار</a>
            <Link href="/dashboard" className="btn btn-outline-primary btn-sm">
              دخول المنصة
            </Link>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              تجربة مجانية <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '6rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="hero-element" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <Sparkles size={16} color="var(--color-accent)" />
            <span>جيل جديد من وكلاء الذكاء الاصطناعي لخدمة العملاء والمبيعات</span>
          </div>

          <h1 className="hero-element gradient-text" style={{ fontSize: '3.25rem', fontWeight: 900, lineHeight: '1.15', marginBottom: '1.25rem' }}>
            ضاعف مبيعاتك وأتمت خدمة عملاء الواتساب بالذكاء الاصطناعي
          </h1>

          <p className="hero-element text-muted" style={{ fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
            اربط متجرك أو شركتك بـ **AI Agents** مدربة خصيصاً للتفاعل مع العملاء، الإجابة على الاستفسارات، وتحديث الـ CRM آلياً 24 ساعة بدون توقف.
          </p>

          <div className="hero-element" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              ابدأ تجربتك المجانية الان <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              شاهد كيف يعمل المنظومة
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '5rem 1.5rem', background: 'var(--color-bg-subtle)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>كل ما تحتاجه لإدارة المبيعات الآلية</h2>
            <p className="text-muted" style={{ fontSize: '1.05rem' }}>صُممت المنصة خصيصاً للشركات المتوسطة والصغيرة والمتاجر الإلكترونية</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card feature-card" style={{ padding: '1.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--color-primary-light)' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>خطط أسعار مرنة تناسب الجميع</h2>
            <p className="text-muted" style={{ fontSize: '1.05rem' }}>اختر الخطة المناسبة لحجم أعمالك مع تجربة مجانية لمدة 7 أيام</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {PRICING.map((p, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: p.highlight ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  position: 'relative',
                  background: p.highlight ? 'var(--color-surface)' : 'var(--color-card)',
                }}
              >
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{p.name}</span>
                  <span className={`badge ${p.highlight ? 'badge-primary' : 'badge-muted'}`}>{p.badge}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{p.price}</span>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>{p.period}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {p.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                      <CheckCircle2 size={16} color="var(--color-success)" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link href="/dashboard" className={`btn ${p.highlight ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '2.5rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            © 2026 <b>EriaFlow</b>. جميع الحقوق محفوظة.
          </div>
          <div>
            تطوير وابتكار: <b>Mohamed Salem (Expert AI Engineer & Automation Architect)</b>
          </div>
        </div>
      </footer>
    </div>
  );
}
