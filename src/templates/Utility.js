import Link from 'next/link';
import PageHeadMedia from '@/components/PageHeadMedia';
import SplitText from '@/components/SplitText';
import SiteSearch from '@/components/SiteSearch';
import { LIVE_ROUTES, getPosts } from '@/lib/content';
import { BOOKING_SERVICES } from '@/lib/site';
import { Arrow } from '@/components/Icons';
import s from './Utility.module.css';

/* /cart-page — the Wix Stores cart exists but no products are sold (06 §8). */
export function Cart() {
  return (
    <section className={s.hero}>
      <div className={`container ${s.cart}`}>
        <div>
          <SplitText as="h1" mode="hero" className={s.title} text="My cart" />
          <p className="lead" data-hero-in>Cart is empty</p>
          <Link href="/" className="link-arrow" data-hero-in>Continue Browsing<Arrow className="" /></Link>
        </div>
        <aside className={s.summary} data-hero-in>
          <h2 className={s.summaryTitle}>Order summary</h2>
          <p>Alive retreats are designed one to one and quoted personally, so there is nothing to check out online.</p>
          <Link href="/get-a-quote" className="btn btn-dark btn-sm">Request A Quote<Arrow /></Link>
        </aside>
      </div>
    </section>
  );
}

/* /search — rebuilt over the site's real pages and posts (the source showed Wix demo products, 07 A8). */
export function Search() {
  const skip = new Set(['/search', '/cart-page']);
  const posts = getPosts();
  const index = [
    ...LIVE_ROUTES.filter((r) => !skip.has(r.route) && !r.route.startsWith('/post/') && !r.route.startsWith('/service-page/')).map((r) => ({ title: r.h1 && r.h1.length < 90 && !/^\W*\d/.test(r.h1) ? r.h1.replace(/\u200B/g, '').trim() : (r.title || r.route).split(' | ')[0], desc: r.title, href: r.route, kind: 'Pages' })),
    ...posts.map((p) => ({ title: p.title, desc: p.excerpt, href: p.route, kind: 'Blog Posts' })),
    ...BOOKING_SERVICES.map((b) => ({ title: b.name, desc: `${b.duration}${b.tagline ? ' · ' + b.tagline : ''}`, href: `/service-page/${b.slug}`, kind: 'Services' })),
  ];
  return (
    <section className={s.hero}>
      <div className="container">
        <div className="page-head">
          <div className="page-head-text">
            <SplitText as="h1" mode="hero" className={s.title} text="Search this site" />
          </div>
          <PageHeadMedia route="/search" />
        </div>
        <SiteSearch index={index} />
      </div>
    </section>
  );
}
