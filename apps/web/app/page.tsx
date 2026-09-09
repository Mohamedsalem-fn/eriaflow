// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{
          width: '64px', height: '64px', margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.75rem' }}>⚡</span>
        </div>
        <h1 className="gradient-text" style={{ marginBottom: '1rem' }}>EriaFlow</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          منصة الذكاء الاصطناعي لأتمتة المبيعات وخدمة العملاء
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            لوحة التحكم <ArrowRight size={18} />
          </Link>
          <Link href="/auth/login" className="btn btn-secondary btn-lg">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
