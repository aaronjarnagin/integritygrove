import { STAGING } from '../config';

/* Staging still allows crawling on purpose: Google has to fetch a page to see its noindex tag.
   Blocking it here would let the bare URL get listed anyway. No sitemap is advertised while staging. */
export function GET() {
  const body = STAGING
    ? 'User-agent: *\nAllow: /\n'
    : 'User-agent: *\nAllow: /\n\nSitemap: https://integritygrove.com/sitemap-index.xml\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
