// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(token: string | null = null) {
    this.baseUrl = `${API_URL}/api/v1`;
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error((error as { error?: string }).error ?? `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ─── Tenant ────────────────────────────────────────────────────────────────
  getTenant()                { return this.request('/tenants/me'); }
  updateTenant(data: object) { return this.request('/tenants/me', { method: 'PATCH', body: JSON.stringify(data) }); }
  createTenant(data: object) { return this.request('/tenants', { method: 'POST', body: JSON.stringify(data) }); }

  // ─── Agents ────────────────────────────────────────────────────────────────
  getAgents()                        { return this.request('/agents'); }
  createAgent(data: object)          { return this.request('/agents', { method: 'POST', body: JSON.stringify(data) }); }
  updateAgent(id: string, data: object) { return this.request(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  deleteAgent(id: string)            { return this.request(`/agents/${id}`, { method: 'DELETE' }); }

  // ─── Contacts / CRM ────────────────────────────────────────────────────────
  getContacts(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/contacts${qs}`);
  }
  getContact(id: string)             { return this.request(`/contacts/${id}`); }
  createContact(data: object)        { return this.request('/contacts', { method: 'POST', body: JSON.stringify(data) }); }
  updateContact(id: string, data: object) { return this.request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }

  // ─── Conversations ─────────────────────────────────────────────────────────
  getConversations(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/conversations${qs}`);
  }
  getMessages(conversationId: string) { return this.request(`/conversations/${conversationId}/messages`); }
  sendMessage(conversationId: string, content: string) {
    return this.request(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
  }
  takeover(conversationId: string)   { return this.request(`/conversations/${conversationId}/takeover`, { method: 'PATCH' }); }
  resolve(conversationId: string)    { return this.request(`/conversations/${conversationId}/resolve`, { method: 'PATCH' }); }

  // ─── Analytics ─────────────────────────────────────────────────────────────
  getAnalyticsOverview()  { return this.request('/analytics/overview'); }
  getDailyConversations() { return this.request('/analytics/conversations/daily'); }

  // ─── Billing ───────────────────────────────────────────────────────────────
  getPlans() { return this.request('/billing/plans'); }
  getUsage() { return this.request('/billing/usage'); }
}
