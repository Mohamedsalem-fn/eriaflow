// -------------------------------------------------------------------------------
// Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
// Focus: AI Engineering | Automation | Agentic Systems
// Copyright (c) 2026. All Rights Reserved.
// -------------------------------------------------------------------------------
// Eria AI Gateway — Cloudflare Worker
// Proxies OpenAI-compatible API requests to agentrouter.org
// Used as the default AI provider for the EriaFlow platform
// -------------------------------------------------------------------------------

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Route all requests through agentrouter.org
    url.hostname = 'agentrouter.org';

    // Build modified headers — required by agentrouter.org
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set('User-Agent',                  'RooCode/3.51.1');
    modifiedHeaders.set('HTTP-Referer',                'https://github.com/RooVetGit/Roo-Cline');
    modifiedHeaders.set('X-Title',                     'Roo Code');
    modifiedHeaders.set('X-Stainless-Lang',            'js');
    modifiedHeaders.set('X-Stainless-Package-Version', '5.12.2');
    modifiedHeaders.set('X-Stainless-OS',              'Linux');
    modifiedHeaders.set('X-Stainless-Arch',            'x64');
    modifiedHeaders.set('X-Stainless-Runtime',         'node');
    modifiedHeaders.set('X-Stainless-Runtime-Version', 'v22.21.1');
    modifiedHeaders.set('Accept',                      'application/json');
    modifiedHeaders.set('Content-Type',                'application/json');

    // Forward the request
    const proxied = new Request(url, {
      method:   request.method,
      body:     request.body,
      headers:  modifiedHeaders,
      redirect: request.redirect as RequestRedirect,
    });

    return fetch(proxied);
  },
};
