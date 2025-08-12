# therawvibes

A Cloudflare Worker for serving vibes at custom domains via iframe embedding.

## Overview

This worker creates a seamless iframe that embeds vibes from `vibesdiy.work` at your custom domain. It supports multiple URL patterns and provides a clean, full-screen experience.

## Features

- **Multiple URL patterns**: Supports query parameters, paths, and subdomains
- **Full-screen iframe**: Clean, borderless embedding
- **Loading states**: Shows loading indicator and error handling
- **Responsive design**: Works on desktop and mobile
- **Security**: Proper iframe sandboxing and CSP headers
- **Caching**: 5-minute cache for better performance

## URL Patterns Supported

1. **Query parameter**: `yourdomain.com?vibe=my-app-slug`
2. **Path**: `yourdomain.com/my-app-slug`  
3. **Subdomain**: `my-app-slug.yourdomain.com`

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your domain**:
   - Update `wrangler.toml` with your domain and zone
   - Add your domain routes

3. **Deploy**:
   ```bash
   npm run deploy
   ```

## Development

```bash
# Start local development
npm run dev

# Deploy to staging
npm run deploy:staging

# Deploy to production  
npm run deploy
```

## Configuration

### Domain Setup

Update `wrangler.toml`:

```toml
routes = [
  { pattern = "yourdomain.com/*", zone_name = "yourdomain.com" },
  { pattern = "*.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### Environment Variables

Add any needed environment variables to `wrangler.toml`:

```toml
[vars]
CUSTOM_DOMAIN = "yourdomain.com"
```

## Examples

### Basic Usage
- `https://yourdomain.com/my-cool-app` → Embeds `https://my-cool-app.vibesdiy.work/`

### Subdomain Usage  
- `https://my-cool-app.yourdomain.com` → Embeds `https://my-cool-app.vibesdiy.work/`

### Query Parameter Usage
- `https://yourdomain.com?vibe=my-cool-app` → Embeds `https://my-cool-app.vibesdiy.work/`

## License

MIT