'use client';
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import {
  MessageSquare, Users, Bot, TrendingUp, Zap,
  ArrowUpRight, ArrowDownRight, RefreshCw, Clock,
} from 'lucide-react';

// ─── Mock stats (replace with API data in production) ────────────────────────
const STATS = [
  { label: 'محادثة هذا الشهر', value: '342', delta: '+18%', up: true, icon: MessageSquare, color: 'var(--color-primary-light)' },
  { label: 'عملاء جدد', value: '87', delta: '+12%', up: true, icon: Users, color: 'var(--color-accent)' },
  { label: 'معدل الإغلاق', value: '24%', delta: '+4%', up: true, icon: TrendingUp, color: 'var(--color-success)' },
  { label: 'وكلاء نشطون', value: '3', delta: null, up: null, icon: Bot, color: 'var(--color-warning)' },
];

const RECENT = [
  { name: 'أحمد محمد', phone: '0501234567', msg: 'كم سعر الباقة الاحترافية؟', time: 'منذ 2 دقيقة', status: 'active' },
  { name: 'سارة العمري', phone: '0559876543', msg: 'شكراً جزيلاً، تم الطلب', time: 'منذ 8 دقائق', status: 'resolved' },
  { name: 'خالد الزهراني', phone: '0537654321', msg: 'هل يمكن التجربة قبل الشراء؟', time: 'منذ 15 دقيقة', status: 'active' },
  { name: 'ريم الشمري', phone: '0512345678', msg: 'لم أتلق رد على رسالتي', time: 'منذ 30 دقيقة', status: 'human_takeover' },
];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active:        { label: 'نشط', className: 'badge-success' },
  resolved:      { label: 'محلول', className: 'badge-muted' },
  human_takeover:{ label: 'تدخل بشري', className: 'badge-warning' },
};

export default function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    import('animejs').then(({ animate, stagger, onScroll }) => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Staggered entrance for stat cards
        animate('.stat-card', {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 700,
          delay: stagger(80),
          ease: 'outExpo',
        });

        // Recent conversations slide in
        animate('.conv-row', {
          opacity: [0, 1],
          translateX: [20, 0],
          duration: 600,
          delay: stagger(60, { start: 300 }),
          ease: 'outExpo',
        });

        // Animate stat values counting up
        const statValues = document.querySelectorAll('.stat-value-num');
        statValues.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target') ?? '0');
          const obj = { val: 0 };
          animate(obj, {
            val: target,
            duration: 1200,
            ease: 'outExpo',
            delay: 200,
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toLocaleString('ar-SA');
            },
          });
        });
      }
    });

    return () => cleanupFn?.();
  }, []);

  return (
    <div ref={pageRef} className="page-content">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          مرحباً بك 👋
        </h1>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          إليك نظرة عامة على أداء منصتك اليوم
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const numericVal = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;
          return (
            <div key={stat.label} className="stat-card animate-on-load">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: `${stat.color}18`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${stat.color}25`,
                }}>
                  <Icon size={18} color={stat.color} />
                </div>
                {stat.delta && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    fontSize: '0.75rem', fontWeight: 600,
                    color: stat.up ? 'var(--color-success)' : 'var(--color-danger)',
                  }}>
                    {stat.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {stat.delta}
                  </span>
                )}
              </div>
              <div
                className="stat-value"
                style={{ marginBottom: '0.25rem' }}
              >
                {stat.value.includes('%') ? (
                  stat.value
                ) : (
                  <>
                    <span className="stat-value-num" data-target={numericVal}>0</span>
                    {stat.value.replace(/[0-9]/g, '')}
                  </>
                )}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Conversations */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              أحدث المحادثات
            </h3>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>آخر 4 محادثات على المنصة</p>
          </div>
          <a href="/dashboard/inbox" className="btn btn-ghost btn-sm">
            عرض الكل <ArrowUpRight size={14} />
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {RECENT.map((conv, i) => {
            const statusInfo = STATUS_LABELS[conv.status];
            return (
              <div key={i} className="conversation-item conv-row" style={{ opacity: 0 }}>
                <div className="avatar" style={{ fontSize: '0.8rem' }}>
                  {conv.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex-between" style={{ marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{conv.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>
                    </div>
                  </div>
                  <div className="flex-between">
                    <p className="truncate text-muted" style={{ fontSize: '0.8rem', maxWidth: '260px' }}>
                      {conv.msg}
                    </p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--color-text-faint)', flexShrink: 0 }}>
                      <Clock size={11} />
                      {conv.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Status Banner */}
      <div style={{
        marginTop: '1.25rem',
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, hsl(245, 85%, 65%, 0.1) 0%, hsl(165, 80%, 50%, 0.07) 100%)',
        border: '1px solid hsl(245, 85%, 65%, 0.2)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={18} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem' }}>
            وكيل الذكاء الاصطناعي يعمل 24/7
          </p>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            رد على 128 رسالة تلقائياً هذا الأسبوع • وفّر 18 ساعة عمل
          </p>
        </div>
        <div style={{ marginRight: 'auto', textAlign: 'left' }}>
          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
            <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
            متصل
          </span>
        </div>
      </div>
    </div>
  );
}
