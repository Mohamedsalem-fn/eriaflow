'use client';
// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Filter, Send, User, Bot, Clock,
  CheckCircle2, AlertCircle, Phone, Tag, MoreVertical, Sparkles, RefreshCw
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent' | 'human';
  content: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface Conversation {
  id: string;
  contactName: string;
  phone: string;
  channel: 'whatsapp' | 'instagram' | 'email';
  lastMessage: string;
  lastTime: string;
  unread: number;
  status: 'active' | 'human_takeover' | 'resolved';
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Closed';
  assignedAgent: string;
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    contactName: 'أحمد محمد الخالدي',
    phone: '+966501234567',
    channel: 'whatsapp',
    lastMessage: 'كم سعر الباقة الاحترافية لشهرين؟',
    lastTime: '10:42 ص',
    unread: 2,
    status: 'active',
    stage: 'Qualified',
    assignedAgent: 'وكيل المبيعات الألي',
    messages: [
      { id: 'm1', sender: 'user', content: 'السلام عليكم، أريد الاستفسار عن باقات EriaFlow', timestamp: '10:38 ص' },
      { id: 'm2', sender: 'agent', content: 'وعليكم السلام ورحمة الله! أهلاً بك أ. أحمد. يسعدنا اهتمامك. لدينا باقة البداية والباقة الاحترافية وباقة الشركات. أيهما يناسب حجم فريقك؟', timestamp: '10:39 ص', sentiment: 'positive' },
      { id: 'm3', sender: 'user', content: 'كم سعر الباقة الاحترافية لشهرين؟', timestamp: '10:42 ص' },
    ],
  },
  {
    id: 'conv-2',
    contactName: 'سارة العمري',
    phone: '+966559876543',
    channel: 'whatsapp',
    lastMessage: 'شكراً جزيلاً، تم تفعيل الحساب بنجاح',
    lastTime: '09:15 ص',
    unread: 0,
    status: 'resolved',
    stage: 'Closed',
    assignedAgent: 'وكيل الدعم الفني',
    messages: [
      { id: 'm4', sender: 'user', content: 'كيف أقوم بربط رقم الواتساب بالمنصة؟', timestamp: '09:00 ص' },
      { id: 'm5', sender: 'agent', content: 'أهلاً سارة! يمكنك التوجه إلى صفحة الإعدادات ← ربط القنوات ← المسح الضوئي لرمز QR الخاصة بـ Meta WhatsApp Cloud API.', timestamp: '09:05 ص' },
      { id: 'm6', sender: 'user', content: 'شكراً جزيلاً، تم تفعيل الحساب بنجاح', timestamp: '09:15 ص' },
    ],
  },
  {
    id: 'conv-3',
    contactName: 'م. خالد الزهراني',
    phone: '+966537654321',
    channel: 'instagram',
    lastMessage: 'أريد التحدث مع موظف مبيعات مباشر',
    lastTime: 'أمس 11:30 م',
    unread: 1,
    status: 'human_takeover',
    stage: 'Proposal',
    assignedAgent: 'تم التحويل للبشر',
    messages: [
      { id: 'm7', sender: 'user', content: 'هل يمكن عمل استثناء وتخصيص وكيل خاص بمجال العقارات؟', timestamp: '11:20 م' },
      { id: 'm8', sender: 'agent', content: 'نعم بالتأكيد! يمكن للـ Custom AI Agent التعلم من ملفات العقارات والمخططات الخاصة بك.', timestamp: '11:25 م' },
      { id: 'm9', sender: 'user', content: 'أريد التحدث مع موظف مبيعات مباشر', timestamp: '11:30 م' },
    ],
  },
];

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>('conv-1');
  const [inputMsg, setInputMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === selectedId) || conversations[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('animejs').then(({ animate, stagger }) => {
        animate('.conv-card', {
          opacity: [0, 1],
          translateX: [-15, 0],
          duration: 500,
          delay: stagger(60),
          ease: 'outExpo',
        });
      });
    }
  }, [filterStatus]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'human',
      content: inputMsg,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          lastMessage: inputMsg,
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    }));

    setInputMsg('');
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const toggleTakeover = () => {
    setConversations(prev => prev.map(c => {
      if (c.id === selectedId) {
        const nextStatus = c.status === 'human_takeover' ? 'active' : 'human_takeover';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const filteredConversations = conversations.filter(c => {
    if (filterStatus === 'active') return c.status === 'active';
    if (filterStatus === 'takeover') return c.status === 'human_takeover';
    if (filterStatus === 'resolved') return c.status === 'resolved';
    return true;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar / List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
            <input
              type="text"
              placeholder="بحث في المحادثات..."
              className="form-input"
              style={{ paddingRight: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: 'الذكاء الاصطناعي' },
              { id: 'takeover', label: 'تدخل بشري' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`btn btn-sm ${filterStatus === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, fontSize: '0.75rem', padding: '4px 8px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List items */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredConversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`conv-card conversation-item ${selectedId === c.id ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar" style={{ background: c.status === 'human_takeover' ? 'var(--color-warning)20' : undefined }}>
                {c.contactName.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex-between" style={{ marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.contactName}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)' }}>{c.lastTime}</span>
                </div>
                <div className="flex-between">
                  <p className="truncate text-muted" style={{ fontSize: '0.78rem' }}>{c.lastMessage}</p>
                  {c.unread > 0 && (
                    <span className="badge badge-primary" style={{ borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem' }}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat View */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="avatar">{activeConv.contactName.charAt(0)}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{activeConv.contactName}</h3>
                <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{activeConv.stage}</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.78rem' }}>{activeConv.phone} • {activeConv.assignedAgent}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={toggleTakeover}
              className={`btn btn-sm ${activeConv.status === 'human_takeover' ? 'btn-outline-danger' : 'btn-outline-primary'}`}
              style={{ fontSize: '0.8rem', gap: '6px' }}
            >
              {activeConv.status === 'human_takeover' ? (
                <>
                  <Bot size={15} /> إرجاع للذكاء الاصطناعي
                </>
              ) : (
                <>
                  <User size={15} /> التدخل يدوياً
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-bg-subtle)' }}>
          {activeConv.messages.map((m) => {
            const isUser = m.sender === 'user';
            const isAI = m.sender === 'agent';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-start' : 'flex-end',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)' }}>
                    {isUser ? activeConv.contactName : isAI ? '🤖 وكيل الذكاء الاصطناعي' : '👤 أنت (موظف)'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-faint)' }}>{m.timestamp}</span>
                </div>
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '0.75rem 1rem',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    background: isUser
                      ? 'var(--color-card)'
                      : isAI
                      ? 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))'
                      : 'var(--color-accent)',
                    color: isUser ? 'var(--color-text)' : '#ffffff',
                    border: isUser ? '1px solid var(--color-border)' : 'none',
                    boxShadow: isUser ? 'var(--shadow-sm)' : '0 2px 8px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={activeConv.status === 'human_takeover' ? 'اكتب ردك المباشر للعميل...' : 'أنت في وضع المعاينة - للرد المباشر اضغط "التدخل يدوياً"'}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
            <span>إرسال</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
