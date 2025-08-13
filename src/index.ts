/**
 * Vibebox: Simple Cloudflare Worker Implementation
 * Serves static iframe.html content for secure, isolated iframe hosting
 * Also handles /vibe/{slug} pattern with postMessage communication
 */

import iframeHtml from './iframe.html';
import wrapperHtml from './wrapper.html';

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
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};

/**
 * Handle /vibe/{slug} requests with wrapper that uses postMessage
 */
async function handleVibeWrapper(slug: string, origin: string): Promise<Response> {
  // Replace template placeholders
  const html = wrapperHtml.replaceAll('{{slug}}', slug).replaceAll('{{origin}}', origin);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300', // Shorter cache for dynamic content
    },
  });
}
