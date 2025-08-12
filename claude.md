# CLAUDE.md

This file provides guidance to Claude Code when working with the vibesbox project.

## Project Overview

Vibesbox is an ultra-minimal Cloudflare Worker that serves a single static HTML file to provide secure, isolated iframe hosting for Vibes.diy applications. The project has been simplified from its previous incarnation to focus solely on serving static content.

## Key Architecture

- **Entry Point**: `src/index.ts` - Simple Cloudflare Worker that serves static HTML
- **Static Content**: `src/iframe.html` - Complete iframe HTML embedded as string constant
- **Domain Pattern**: `*.vibesbox.dev` - Supports unlimited subdomains automatically
- **Functionality**: Static HTML serving with CORS and security headers

## Development Commands

```bash
# Development server (use pnpm) - runs on http://localhost:8989
pnpm dev

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy
```

## Technical Details

### Core Functionality

The worker:
1. Serves the exact same static HTML content for all requests
2. Handles any subdomain pattern (*.vibesbox.dev)
3. Sets proper CORS and security headers
4. Provides global CDN distribution via Cloudflare

### Key Features

- **Zero Complexity**: Just serves static HTML - no dynamic logic
- **Global CDN**: Cloudflare's edge network for speed
- **Infinite Scale**: Handles unlimited subdomains automatically
- **Perfect Isolation**: Each subdomain = unique origin for security
- **Cost Effective**: Minimal Cloudflare Worker costs

### Static HTML Content

The iframe.html includes:
- React 19.1.1 and modern JavaScript tooling
- Babel standalone for JSX transformation
- TailwindCSS browser build
- html2canvas-pro for screenshots
- Complete error handling and postMessage communication
- Code execution environment for Vibes applications

### URL Patterns

- All routes: Serve the same static iframe.html content
- No special endpoints or dynamic routing needed

### Configuration

- Domain: `vibesbox.dev` with wildcard subdomain support
- Routes configured for `*.vibesbox.dev/*` in `wrangler.toml`
- Headers: CORS enabled, X-Frame-Options set to ALLOWALL

### Security Considerations

- Static content reduces attack surface significantly
- CORS headers properly configured
- iframe sandbox handled by the embedded HTML content
- Each subdomain provides isolated origin security

## File Structure

```
vibesbox/
├── src/
│   ├── index.ts          # Minimal static HTML server
│   └── iframe.html       # Complete iframe HTML (embedded as constant)
├── CLAUDE.md             # This file
├── README.md             # Project documentation
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── wrangler.toml         # Cloudflare Workers configuration
```

## Development Guidelines

- Keep the worker as simple as possible - it should only serve static HTML
- Any dynamic behavior should be handled in the iframe's JavaScript, not the worker
- Maintain the iframe.html content as a string constant in the worker
- Test that subdomains work correctly (abc123.vibesbox.dev should serve the iframe)

## Deployment Notes

- DNS Configuration needed:
  - `vibesbox.dev` A record to Cloudflare proxy
  - `*.vibesbox.dev` CNAME to vibesbox.dev
- No dynamic logic means no server complexity or state to manage
- The iframe handles all dynamic behavior via postMessage communication
- Worker literally just returns the same HTML file for every request to any subdomain