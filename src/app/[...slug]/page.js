import { notFound } from 'next/navigation';
import { LIVE_ROUTES, getPageByRoute } from '@/lib/content';
import { pageMetadata, JsonLd } from '@/lib/seo';
import Landing from '@/templates/Landing';
import Destination from '@/templates/Destination';
import Faq from '@/templates/Faq';
import Legal from '@/templates/Legal';
import { BlogIndex, Post } from '@/templates/Blog';
import { Contact, GetAQuote, BookCall, ChatPage, Download, PdfPage } from '@/templates/Contact';
import { BookOnline, BookingCalendar, ServicePage } from '@/templates/Booking';
import { Cart, Search } from '@/templates/Utility';

export const dynamicParams = false;

export function generateStaticParams() {
  return LIVE_ROUTES.filter((r) => r.route !== '/').map((r) => ({ slug: r.route.slice(1).split('/') }));
}

const routeOf = async (params) => '/' + (await params).slug.join('/');

export async function generateMetadata({ params }) {
  const page = getPageByRoute(await routeOf(params));
  return page ? pageMetadata(page) : {};
}

function pick(route) {
  if (route === '/faq-pricing') return Faq;
  if (['/booking-conditions', '/nda', '/privacy-policy'].includes(route)) return Legal;
  if (route === '/blog') return BlogIndex;
  if (route.startsWith('/post/')) return Post;
  if (route === '/contact') return Contact;
  if (route === '/get-a-quote') return GetAQuote;
  if (route === '/book-call') return BookCall;
  if (route === '/instant-pricing-packages-chat') return ChatPage;
  if (route === '/download') return Download;
  if (route === '/pdf') return PdfPage;
  if (route === '/book-online') return BookOnline;
  if (route.startsWith('/booking-calendar/')) return BookingCalendar;
  if (route.startsWith('/service-page/')) return ServicePage;
  if (route === '/cart-page') return Cart;
  if (route === '/search') return Search;
  if (route === '/bali' || route === '/mexico-wellness-retreat') return Destination;
  return Landing;
}

export default async function Page({ params }) {
  const route = await routeOf(params);
  const page = getPageByRoute(route);
  if (!page) notFound();
  const T = pick(route);
  return (
    <>
      <JsonLd page={page} />
      <T page={page} />
    </>
  );
}
