# Vibesbox

Ultra-minimal Cloudflare Worker for secure, isolated iframe hosting for Vibes.diy applications.

## Overview

Vibesbox is a simple Cloudflare Worker that serves a single static HTML file to provide secure, isolated iframe hosting. The worker accepts any subdomain pattern (*.vibesbox.dev) and returns the exact same iframe.html content for all requests - no dynamic logic needed.

## Architecture

```
vibesbox.dev/* → Cloudflare Worker → Static iframe.html
```

## Key Benefits

- **Zero server complexity**: Just serves static HTML
- **Global CDN**: Cloudflare's edge network for speed  
- **Infinite scale**: Handles unlimited subdomains automatically
- **Perfect isolation**: Each subdomain = unique origin for security
- **Cost effective**: Minimal Cloudflare Worker costs

## Features

- **Static HTML serving**: Same content for all requests
- **Wildcard subdomain support**: `*.vibesbox.dev` works automatically
- **Modern JavaScript environment**: React 19.1.1, Babel, TailwindCSS
- **Screenshot capabilities**: html2canvas-pro integration
- **Error handling**: Complete JSX/React error reporting
- **postMessage communication**: Full parent-iframe messaging

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Deploy**:
   ```bash
   pnpm deploy
   ```

## Development

```bash
# Start local development (port 8989)
pnpm dev

# Deploy to staging
pnpm deploy:staging

# Deploy to production  
pnpm deploy
```

## DNS Configuration

```
vibesbox.dev        A     192.0.2.1 (Cloudflare proxy)
*.vibesbox.dev      CNAME vibesbox.dev
```

## How It Works

1. **Any request** to any subdomain (abc123.vibesbox.dev, test.vibesbox.dev, etc.)
2. **Returns identical HTML** - the complete iframe.html content as a string constant
3. **iframe handles everything** - code execution, rendering, screenshots via postMessage
4. **No server logic** - the worker doesn't parse subdomains or transform content

## Worker Implementation

```typescript
export default {
  async fetch(): Promise<Response> {
    return new Response(IFRAME_HTML, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-Frame-Options': 'ALLOWALL',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
};
```

## No Dynamic Logic Needed

The worker doesn't need to:
- Parse subdomain names
- Store or retrieve data
- Transform content  
- Handle routing

It literally just returns the same HTML file for every request to any subdomain.

## License

MIT