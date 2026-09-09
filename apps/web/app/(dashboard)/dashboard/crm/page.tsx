'use client';
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Filter, Phone, Mail, Tag,
  MoreHorizontal, ChevronDown, CheckCircle2, ArrowRight
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Closed';
  score: number;
  source: 'WhatsApp' | 'Instagram' | 'Web';
  lastActivity: string;
  notes: string;
}

const INITIAL_CONTACTS: Contact[] = [
  { id: 'c1', name: 'أحمد محمد الخالدي', phone: '+966501234567', email: 'ahmed@example.com', stage: 'Qualified', score: 85, source: 'WhatsApp', lastActivity: 'منذ ساعتين', notes: 'مهتم بالباقة الاحترافية' },
  { id: 'c2', name: 'سارة العمري', phone: '+966559876543', email: 'sara@example.com', stage: 'Closed', score: 98, source: 'WhatsApp', lastActivity: 'اليوم 09:15 ص', notes: 'تم الاشتراك بنجاح' },
  { id: 'c3', name: 'م. خالد الزهراني', phone: '+966537654321', email: 'khaled@example.com', stage: 'Proposal', score: 72, source: 'Instagram', lastActivity: 'أمس 11:30 م', notes: 'طلب تخصيص وكيل عقاري' },
  { id: 'c4', name: 'شركة الأمل للتجارة', phone: '+966512345678', email: 'info@alamal.sa', stage: 'Lead', score: 45, source: 'Web', lastActivity: 'منذ يومين', notes: 'استفسار من نموذج الموقع' },
];

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Closed'] as const;

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('animejs').then(({ animate, stagger }) => {
        animate('.crm-row', {
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 450,
          delay: stagger(50),
          ease: 'outExpo',
        });
      });
    }
  }, [selectedStage]);

  const filtered = contacts.filter(c => {
    const matchesSearch = c.name.includes(search) || c.phone.includes(search) || c.email.includes(search);
    const matchesStage = selectedStage === 'all' || c.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            إدارة العملاء (CRM)
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            تتبع وتسجيل حركة العملاء والمبيعات التي ينشئها وكلاء الذكاء الاصطناعي تلقائياً
          </p>
        </div>
        <button className="btn btn-primary" style={{ gap: '6px' }}>
          <Plus size={16} /> إضافة عميل جديد
        </button>
      </div>

      {/* Filters bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم، الإيميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingRight: '36px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setSelectedStage('all')}
            className={`btn btn-sm ${selectedStage === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          >
            الكل ({contacts.length})
          </button>
          {STAGES.map(stage => {
            const count = contacts.filter(c => c.stage === stage).length;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`btn btn-sm ${selectedStage === stage ? 'btn-primary' : 'btn-ghost'}`}
              >
                {stage} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>العميل</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>بيانات الاتصال</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>المرحلة</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>درجة الجاهزية (Score)</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>المصدر</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>آخر نشاط</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="crm-row" style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>{c.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{c.notes}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {c.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-faint)' }}><Mail size={12} /> {c.email}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span className={`badge ${
                    c.stage === 'Closed' ? 'badge-success' :
                    c.stage === 'Proposal' ? 'badge-primary' :
                    c.stage === 'Qualified' ? 'badge-accent' : 'badge-muted'
                  }`}>
                    {c.stage}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--color-surface)', borderRadius: '3px', width: '60px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${c.score}%`, background: c.score > 80 ? 'var(--color-success)' : c.score > 60 ? 'var(--color-primary)' : 'var(--color-warning)' }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>%{c.score}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem' }}>{c.source}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>{c.lastActivity}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
