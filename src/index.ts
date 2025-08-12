/**
 * Vibebox: Simple Cloudflare Worker Implementation
 * Serves static iframe.html content for secure, isolated iframe hosting
 * Also handles /vibe/{slug} pattern with postMessage communication
 */

import iframeHtml from './iframe.html';

export interface Env {
  // Add any environment variables here
}

const DEFAULT_VIBE_SLUG = 'quick-cello-8104';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle /vibe/{slug} pattern
    if (url.pathname.startsWith('/vibe/') || url.pathname === '/vibe') {
      const pathSegments = url.pathname.split('/');
      const slug = pathSegments[2] || DEFAULT_VIBE_SLUG;
      
      return handleVibeWrapper(slug, url.origin);
    }
    
    // Default: Return the static iframe HTML content
    return new Response(iframeHtml, {
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

/**
 * Handle /vibe/{slug} requests with wrapper that uses postMessage
 */
async function handleVibeWrapper(slug: string, origin: string): Promise<Response> {
  const wrapperHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${slug} - Vibesbox</title>
  <meta name="description" content="Experience ${slug} - an AI-generated vibe">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${slug} - Vibesbox">
  <meta property="og:description" content="Experience ${slug} - an AI-generated vibe">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${origin}/vibe/${slug}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${slug} - Vibesbox">
  <meta name="twitter:description" content="Experience ${slug} - an AI-generated vibe">
  
  <style>
    body, html { 
      margin: 0; 
      padding: 0; 
      height: 100%; 
      overflow: hidden; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    iframe { 
      width: 100%; 
      height: 100vh; 
      border: none;
      display: block;
    }
    
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #666;
      font-size: 18px;
      z-index: 1000;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .error {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #d32f2f;
      font-size: 16px;
      z-index: 1000;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="loading" id="loading">Loading ${slug}...</div>
  <div class="error" id="error" style="display: none;">
    <h3>Failed to load vibe</h3>
    <p>Could not fetch code for "${slug}"</p>
    <a href="https://vibes.diy" style="color: #1976d2; text-decoration: none;">Create your own →</a>
  </div>
  <iframe
    id="vibeFrame"
    src="${origin}/"
    title="${slug}"
    style="display: none;">
  </iframe>

  <script>
    const iframe = document.getElementById('vibeFrame');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    async function loadVibe() {
      try {
        // Fetch the JSX code
        const response = await fetch('https://${slug}.vibesdiy.app/App.jsx');
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}\`);
        }
        const code = await response.text();
        
        // Wait for iframe to load
        iframe.onload = () => {
          // Send code to iframe via postMessage
          iframe.contentWindow.postMessage({
            type: 'execute-code',
            code: code,
            apiKey: 'sk-vibes-proxy-managed',
            sessionId: 'vibe-session-${slug}'
          }, '*');
          
          // Hide loading, show iframe
          loading.style.display = 'none';
          iframe.style.display = 'block';
        };
        
      } catch (err) {
        console.error('Failed to load vibe:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
      }
    }
    
    // Start loading when page loads
    loadVibe();
  </script>
</body>
</html>`;

  return new Response(wrapperHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300', // Shorter cache for dynamic content
    },
  });
}