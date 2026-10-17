'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import s from './Carousel.module.css';

/** Horizontal scroll-snap track with previous/next controls and a GSAP progress hairline. */
export default function Carousel({ children, label = 'Gallery', itemClass }) {
  const track = useRef(null);
  const bar = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? el.scrollLeft / max : 1;
      gsap.to(bar.current, { scaleX: Math.max(0.06, p), duration: reduce.matches ? 0 : 0.4, ease: 'power2.out', overwrite: true });
      const start = el.scrollLeft < 8, end = el.scrollLeft > max - 8;
      setEdge((e) => (e.start === start && e.end === end ? e : { start, end }));
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const go = (dir) => {
    const el = track.current;
    const item = el.firstElementChild;
    const step = item ? item.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className={s.wrap} role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={track} className={`${s.track} no-scrollbar`} tabIndex={0}>
        {Array.isArray(children) ? children.map((c, i) => <div key={i} className={`${s.item} ${itemClass || ''}`}>{c}</div>) : <div className={s.item}>{children}</div>}
      </div>
      <div className={`container ${s.controls}`}>
        <span className={s.progress} aria-hidden="true"><span ref={bar} /></span>
        <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label={`Previous: ${label}`}>
          <svg viewBox="0 0 22 8" width="22" height="8" aria-hidden="true"><path d="M22 4H1.5M4.5 1l-3 3 3 3" stroke="currentColor" fill="none" /></svg>
        </button>
        <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label={`Next: ${label}`}>
          <svg viewBox="0 0 22 8" width="22" height="8" aria-hidden="true"><path d="M0 4h20.5M17.5 1l3 3-3 3" stroke="currentColor" fill="none" /></svg>
        </button>
      </div>
    </div>
  );
}
