/**
 * Vibebox: Simple Cloudflare Worker Implementation
 * Serves static iframe.html content for secure, isolated iframe hosting
 */

import iframeHtml from './iframe.html';

export interface Env {
  // Add any environment variables here
}

export default {
  async fetch(): Promise<Response> {
    // Return the static HTML content for all requests
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