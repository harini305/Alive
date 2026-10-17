import Link from 'next/link';
import Img from '@/components/Img';
import { ASSETS } from '@/lib/site';
import { Arrow } from '@/components/Icons';

export const metadata = { title: 'Page not found | Alive Luxury Wellness Retreats', robots: { index: false } };

export default function NotFound() {
  return (
    <section style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', padding: 'calc(var(--header-h) + 48px) var(--gutter) 96px', background: 'var(--ivory)', textAlign: 'center' }}>
      <div style={{ display: 'grid', gap: 22, justifyItems: 'center', maxWidth: 640 }}>
        <Img file={ASSETS.logo} alt="" sizes="120px" style={{ width: 120, height: 'auto' }} priority />
        <h1 style={{ fontSize: 'var(--fs-h1)' }}>This page could not be found</h1>
        <p className="lead">The page you are looking for may have moved. Every Alive program, location and package is still a click away.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Link href="/" className="btn btn-dark">Return Home<Arrow /></Link>
          <Link href="/wellness-retreat-programs" className="link-arrow">Program Focus<Arrow className="" /></Link>
          <Link href="/contact" className="link-arrow">Contact Us<Arrow className="" /></Link>
        </div>
      </div>
    </section>
  );
}
