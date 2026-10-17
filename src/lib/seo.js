import { SITE_URL } from './site';

const TITLE_FALLBACK = {
  '/privacy-policy': 'Privacy Policy & GDPR | Alive Luxury Wellness Retreats',
  '/booking-conditions': 'Booking Conditions | Alive Luxury Wellness Retreats',
  '/nda': 'Alive Non-Disclosure & Confidentiality Agreement | Alive Luxury Wellness Retreats',
  '/pdf': 'Download Our VIP Private Retreat Package | Alive Luxury Wellness Retreats',
  '/cart-page': 'My Cart | Alive Luxury Wellness Retreats',
  '/search': 'Search | Alive Luxury Wellness Retreats',
};

export function pageMetadata(page) {
  const title = page.title || TITLE_FALLBACK[page.route] || `${page.h1?.[0] || 'Alive'} | Alive Luxury Wellness Retreats`;
  const description = page.description || page.post?.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: page.route },
    openGraph: { title, description, url: `${SITE_URL}${page.route === '/' ? '' : page.route}`, type: page.post ? 'article' : 'website' },
    robots: page.route === '/cart-page' || page.route === '/search' ? { index: false, follow: true } : undefined,
  };
}

/** Structured data exactly as published on the source page (01 §12.8 — kept, not altered). */
export function JsonLd({ page }) {
  if (!page.jsonld?.length) return null;
  return page.jsonld.map((j, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j).replace(/</g, '\\u003c') }} />
  ));
}
