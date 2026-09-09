// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EriaFlow — AI Sales & Support Automation',
    template: '%s | EriaFlow',
  },
  description: 'Automate your sales and customer support with AI agents on WhatsApp, Email, and more. The intelligent SaaS platform for SMBs.',
  keywords: ['AI automation', 'WhatsApp bot', 'sales automation', 'CRM', 'AI agent', 'customer service automation'],
  authors: [{ name: 'Mohamed Salem' }],
  openGraph: {
    type: 'website',
    title: 'EriaFlow — AI Sales & Support Automation',
    description: 'Automate your sales and customer support with AI agents. 24/7, no code needed.',
    siteName: 'EriaFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EriaFlow — AI Sales & Support Automation',
    description: 'Automate your sales and customer support with AI agents. 24/7, no code needed.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
