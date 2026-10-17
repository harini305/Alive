import { LIVE_ROUTES } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

// Mirrors the source sitemap intent: utility routes (cart, search) are left out.
export default function sitemap() {
  return LIVE_ROUTES.filter((r) => !['/cart-page', '/search'].includes(r.route)).map((r) => ({
    url: `${SITE_URL}${r.route === '/' ? '' : r.route}`,
  }));
}
