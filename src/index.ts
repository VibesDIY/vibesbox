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

      return handleVibeWrapper(slug, url.origin, url);
    }

    // Default: Return the static iframe HTML content with version parameter support
    return handleIframe(url);
  },
};

/**
 * Extract and validate Fireproof version from URL parameters
 */
function extractFireproofVersion(url: URL): string {
  const versionParam = url.searchParams.get('v_fp') || '';
  const semverPattern = /^\d+\.\d+\.\d+(-[\w.-]+)*$/;
  return semverPattern.test(versionParam) ? versionParam : '0.20.5-dev-preview-7';
}

/**
 * Handle iframe requests with dynamic version support
 */
async function handleIframe(url: URL): Promise<Response> {
  const fireproofVersion = extractFireproofVersion(url);
  
  // Replace the fireproof version in the iframe HTML
  const html = iframeHtml.replace(
    '"use-fireproof": "https://esm.sh/use-fireproof@0.20.5-dev-preview-7"',
    `"use-fireproof": "https://esm.sh/use-fireproof@${fireproofVersion}"`
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

/**
 * Handle /vibe/{slug} requests with wrapper that uses postMessage
 */
async function handleVibeWrapper(slug: string, origin: string, url: URL): Promise<Response> {
  const fireproofVersion = extractFireproofVersion(url);
  
  // Create iframe URL with version parameter if specified
  const iframeUrl = url.searchParams.has('v_fp') ? `/?v_fp=${fireproofVersion}` : '/';
  
  // Replace template placeholders
  let html = wrapperHtml
    .replaceAll('{{slug}}', slug)
    .replaceAll('{{origin}}', origin);
    
  // Update iframe src to include version parameter
  html = html.replace('src="/"', `src="${iframeUrl}"`);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
