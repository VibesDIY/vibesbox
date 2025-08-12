# CLAUDE.md

This file provides guidance to Claude Code when working with the therawvibes project.

## Project Overview

The therawvibes project is a Cloudflare Worker that serves a specific vibe (`silent-zeus-5946`) at custom domains through iframe embedding. It provides proper social card metadata and screenshot passthrough functionality.

## Key Architecture

- **Entry Point**: `src/index.ts` - Main Cloudflare Worker with social card extraction
- **Target Vibe**: `silent-zeus-5946` - The specific vibe being served
- **Source Domain**: `silent-zeus-5946.vibesdiy.work` - Where the original vibe is hosted
- **Functionality**: iframe embedding with social media meta tags and screenshot proxy

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
1. Fetches metadata from the source vibe URL
2. Extracts title and description from HTML
3. Generates proper Open Graph and Twitter Card meta tags
4. Serves the vibe through a full-screen iframe
5. Proxies screenshot requests to maintain social card functionality

### Key Features

- **Social Card Support**: Proper Open Graph and Twitter Card meta tags
- **Screenshot Proxy**: `/screenshot.png` endpoint that fetches from source
- **Responsive Design**: Full-screen iframe with loading states
- **Error Handling**: Fallback HTML when metadata extraction fails
- **Security**: Proper iframe sandboxing with necessary permissions
- **Caching**: 1-hour cache for HTML, screenshots, and metadata

### URL Patterns

- Main page: Serves the iframe-embedded vibe
- `/screenshot.png`: Proxies screenshot from source vibe

### Configuration

- `VIBE_SLUG`: Hardcoded as 'silent-zeus-5946'
- Target domain configuration in `wrangler.toml` routes
- Social media handles: @therawvibes

### Security Considerations

- iframe sandbox with appropriate permissions
- HTML escaping for user-generated content
- CORS headers for screenshot endpoint
- User-Agent identification for bot requests

## File Structure

```
therawvibes/
├── src/
│   └── index.ts          # Main worker implementation
├── notes/
│   └── next.md          # Development roadmap
├── claude.md            # This file
├── README.md            # Project documentation
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── wrangler.toml        # Cloudflare Workers configuration
```

## Development Guidelines

- Follow existing social card patterns from main ai-builder-hosting project
- Maintain proper HTML escaping for security
- Use appropriate cache headers for performance
- Test iframe functionality across different devices
- Ensure screenshot proxy maintains image quality and headers

## Deployment Notes

- Update `wrangler.toml` with actual domain routes before deployment
- Configure Cloudflare DNS for target domain
- Test social card preview on major platforms (Twitter, Discord, etc.)
- Verify iframe loading and responsive behavior