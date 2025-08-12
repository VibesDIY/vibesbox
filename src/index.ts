/**
 * Cloudflare Worker for serving silent-zeus-5946 vibe at custom domain
 * Includes proper social cards and screenshot passthrough
 */

export interface Env {
  // Add any environment variables here
}

const VIBE_SLUG = 'satie-trumpet-8293';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle screenshot requests
    if (url.pathname === '/screenshot.png') {
      return handleScreenshotRequest();
    }
    
    try {
      // Fetch the source vibe HTML to extract meta tags
      const sourceUrl = `https://${VIBE_SLUG}.vibesdiy.work/`;
      const sourceResponse = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TheRawVibes-Bot/1.0)',
        },
      });

      if (!sourceResponse.ok) {
        return new Response('Vibe not found', { status: 404 });
      }

      const sourceHtml = await sourceResponse.text();

      // Extract title and description from source HTML
      const titleMatch = sourceHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
      const descMatch = sourceHtml.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
      );

      const title = titleMatch ? titleMatch[1] : `${VIBE_SLUG} - The Raw Vibes`;
      const description = descMatch
        ? descMatch[1]
        : `Experience ${VIBE_SLUG} - an AI-generated vibe created with Vibes DIY`;

      // HTML with proper social cards and iframe
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url.origin}">
  <meta property="og:image" content="${url.origin}/screenshot.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="The Raw Vibes">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${url.origin}/screenshot.png">
  <meta name="twitter:site" content="@therawvibes">
  
  <style>
    body, html { 
      margin: 0; 
      padding: 0; 
      height: 100%; 
      overflow: hidden; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #666;
      font-size: 18px;
      z-index: 1000;
    }
    
    iframe { 
      width: 100%; 
      height: 100vh; 
      border: none;
      display: block;
    }
    
    .footer {
      position: fixed;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
      z-index: 1000;
    }
    
    .footer a {
      color: #ccc;
      text-decoration: none;
    }
    
    .footer a:hover {
      color: white;
    }
  </style>
</head>
<body>
  <iframe
    src="https://${VIBE_SLUG}.vibesdiy.work/"
    title="${escapeHtml(title)}"
    allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; hid; microphone; midi; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; serial; usb; web-share; xr-spatial-tracking"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-orientation-lock allow-pointer-lock allow-downloads allow-top-navigation"
    allowfullscreen
    onload="document.getElementById('loading').style.display='none'">
  </iframe>
</body>
</html>`;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600', // 1 hour cache
        },
      });

    } catch (error) {
      console.error('Error fetching vibe metadata:', error);
      
      // Fallback HTML without meta extraction
      const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${VIBE_SLUG} - The Raw Vibes</title>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
    iframe { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe 
    src="https://${VIBE_SLUG}.vibesdiy.work/"
    allowfullscreen>
  </iframe>
</body>
</html>`;

      return new Response(fallbackHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }
  },
};

/**
 * Handle screenshot requests by proxying to the original vibe
 */
async function handleScreenshotRequest(): Promise<Response> {
  const screenshotUrl = `https://${VIBE_SLUG}.vibesdiy.work/screenshot.png`;
  
  try {
    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      return new Response('Screenshot not found', { status: 404 });
    }
    
    // Return the screenshot with appropriate headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache for screenshots
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching screenshot:', error);
    return new Response('Error fetching screenshot', { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}