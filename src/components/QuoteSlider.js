'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import s from './QuoteSlider.module.css';

// Client quotes exactly as published on the source page (one of them is truncated there, 07 C10).
export default function QuoteSlider({ quotes }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(el, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' });
  }, [i]);
  const n = quotes.length;
  const q = quotes[i].replace(/^[“"']+|[”"']+$/g, '');
  return (
    <figure className={s.wrap} aria-roledescription="carousel" aria-label="Client quotes">
      <span className={s.mark} aria-hidden="true">&ldquo;</span>
      <blockquote ref={ref} className={s.quote} aria-live="polite">
        <p>{q}</p>
      </blockquote>
      <div className={s.controls}>
        {n > 1 && (
          <div className={s.buttons}>
            <button type="button" onClick={() => setI((i - 1 + n) % n)} aria-label="Previous quote">
              <svg viewBox="0 0 22 8" width="22" height="8" aria-hidden="true"><path d="M22 4H1.5M4.5 1l-3 3 3 3" stroke="currentColor" fill="none" /></svg>
            </button>
            <button type="button" onClick={() => setI((i + 1) % n)} aria-label="Next quote">
              <svg viewBox="0 0 22 8" width="22" height="8" aria-hidden="true"><path d="M0 4h20.5M17.5 1l3 3-3 3" stroke="currentColor" fill="none" /></svg>
            </button>
          </div>
        )}
      </div>
    </figure>
  );
}
