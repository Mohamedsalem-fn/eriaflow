'use client';
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Users, Bot, BarChart3,
  Settings, Zap, LogOut, CreditCard, Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'لوحة التحكم', labelEn: 'Dashboard' },
  { href: '/dashboard/inbox',        icon: MessageSquare,   label: 'الصندوق الوارد', labelEn: 'Inbox', badge: '3' },
  { href: '/dashboard/contacts',     icon: Users,           label: 'جهات الاتصال', labelEn: 'CRM Contacts' },
  { href: '/dashboard/agents',       icon: Bot,             label: 'وكلاء الذكاء', labelEn: 'AI Agents' },
  { href: '/dashboard/analytics',    icon: BarChart3,       label: 'التحليلات', labelEn: 'Analytics' },
  { href: '/dashboard/billing',      icon: CreditCard,      label: 'الاشتراك', labelEn: 'Billing' },
  { href: '/dashboard/settings',     icon: Settings,        label: 'الإعدادات', labelEn: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const indicatorRef = useRef<HTMLDivElement>(null);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="logo">EriaFlow</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', marginRight: '40px' }}>
          AI Automation Platform
        </p>
      </div>

      <div className="divider" style={{ margin: '0 1rem 0.75rem' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
              {item.badge && !isActive && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Plan status + Logout */}
      <div style={{ padding: '0.75rem', marginTop: 'auto' }}>
        {/* Usage indicator */}
        <div className="card" style={{ padding: '0.875rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>الخطة المجانية</span>
            <span className="badge badge-muted">Free</span>
          </div>
          <div style={{ marginBottom: '0.4rem' }}>
            <div style={{
              height: '4px',
              background: 'var(--color-border)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}>
              <div ref={indicatorRef} style={{
                height: '100%',
                width: '25%',
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)' }}>25 / 100 محادثة</p>
          <Link href="/dashboard/billing" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.625rem' }}>
            ترقية الخطة
          </Link>
        </div>

        {/* User / Logout */}
        <button className="nav-item" style={{ width: '100%', color: 'var(--color-danger)' }}>
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
