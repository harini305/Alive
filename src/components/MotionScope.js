'use client';
import { useLayoutEffect, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Drives every declarative animation inside a route:
 *  [data-split]          masked word rise (hero: on load, scroll: on enter)
 *  [data-anim=fade-up]   rise + fade on enter (batched)
 *  [data-anim=fade]      fade on enter
 *  [data-anim-stagger]   children rise in sequence
 *  [data-anim=clip]      image wipe reveal with inner scale settle
 *  [data-anim=settle]    above-the-fold media: stays visible, inner image eases from 1.04 scale
 *  [data-parallax=n]     scrubbed vertical drift of an inner image (desktop only)
 *  [data-drift=n]        scrubbed drift of a whole element (desktop only)
 *  [data-hero-media]     hero image settle on load + scroll drift, hero copy fades out
 *  [data-hero-in]        hero supporting elements fade in after the headline
 *  [data-scrub-list]     list items reveal once, row by row, to full opacity
 *  [data-line]           hairline draws across on enter
 *  [data-marquee]        slow horizontal travel tied to scroll (desktop only)
 * Everything lives in one gsap.context scoped to this route and is reverted on unmount.
 */
export default function MotionScope({ children }) {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    window.__aliveMotion = true;
    const q = (sel) => Array.from(root.querySelectorAll(sel));

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // `any` guarantees the callback runs on every viewport (matchMedia only fires when a condition matches)
      mm.add({ any: '(min-width: 0px)', reduce: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 900px)' }, (c) => {
        const { reduce, desktop } = c.conditions;
        if (reduce) {
          gsap.set(q('[data-anim], [data-anim-stagger] > *'), { opacity: 1, y: 0 });
          gsap.set(q('[data-split] .split-inner'), { y: 0 });
          gsap.set(q('[data-anim="clip"]'), { clipPath: 'inset(0% 0% 0% 0%)' });
          return;
        }

        // Headings: masked word rise
        q('[data-split]').forEach((el) => {
          const inner = el.querySelectorAll('.split-inner');
          const delay = parseFloat(el.dataset.delay || 0);
          gsap.set(inner, { y: '110%' });
          const tween = { y: '0%', duration: 1.15, stagger: 0.055, ease: 'expo.out' };
          if (el.dataset.split === 'hero') gsap.to(inner, { ...tween, delay: 0.2 + delay });
          else gsap.to(inner, { ...tween, delay, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
        });

        // Fades (batched)
        const ups = q('[data-anim="fade-up"]');
        gsap.set(ups, { opacity: 0, y: 36 });
        ScrollTrigger.batch(ups, {
          start: 'top 92%',
          once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, overwrite: true }),
        });
        const fades = q('[data-anim="fade"]');
        gsap.set(fades, { opacity: 0 });
        ScrollTrigger.batch(fades, {
          start: 'top 94%',
          once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, duration: 1.4, stagger: 0.08, ease: 'power2.out' }),
        });

        q('[data-anim-stagger]').forEach((el) => {
          const kids = Array.from(el.children);
          gsap.set(kids, { opacity: 0, y: 28 });
          gsap.to(kids, {
            opacity: 1, y: 0, duration: 0.95, stagger: parseFloat(el.dataset.animStagger) || 0.08,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });

        // Image wipe reveals
        q('[data-anim="clip"]').forEach((el) => {
          const media = el.querySelector('img, video');
          const dir = el.dataset.clipFrom || 'bottom';
          const from = { bottom: 'inset(100% 0% 0% 0%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)', top: 'inset(0% 0% 100% 0%)' }[dir];
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
          tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' });
          if (media) tl.fromTo(media, { scale: 1.22 }, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0.05);
        });

        // Priority (LCP) media: never hidden, only a gentle scale settle on load
        q('[data-anim="settle"]').forEach((el) => {
          const media = el.querySelector('img, video');
          if (media) gsap.fromTo(media, { scale: 1.04 }, { scale: 1, duration: 1.8, ease: 'expo.out' });
        });

        // Hairlines
        q('[data-line]').forEach((el) => {
          gsap.fromTo(el, { scaleX: 0, transformOrigin: el.dataset.line === 'center' ? '50% 50%' : '0% 50%' }, {
            scaleX: 1, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 94%', once: true },
          });
        });

        // Hero: media settles in, then drifts while the copy lifts away
        q('[data-hero-media]').forEach((el) => {
          const media = el.querySelector('img, video');
          if (media) gsap.fromTo(media, { scale: 1.14 }, { scale: 1, duration: 2.6, ease: 'expo.out' });
          const hero = el.closest('[data-hero]') || el.parentElement;
          gsap.to(el, { yPercent: 16, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
          const content = hero.querySelector('[data-hero-content]');
          if (content) gsap.to(content, { opacity: 0.15, y: -50, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 15%', scrub: true } });
        });
        q('[data-hero-in]').forEach((el, i) => {
          gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.75 + i * 0.12 });
        });

        if (desktop) {
          q('[data-parallax]').forEach((el) => {
            const media = el.querySelector('img, video') || el;
            const amt = parseFloat(el.dataset.parallax) || 12;
            gsap.fromTo(media, { yPercent: -amt / 2 }, {
              yPercent: amt / 2, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            });
          });
          q('[data-drift]').forEach((el) => {
            const amt = parseFloat(el.dataset.drift) || 60;
            gsap.fromTo(el, { y: amt }, { y: -amt, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
          });
          q('[data-marquee]').forEach((el) => {
            gsap.fromTo(el, { xPercent: 4 }, { xPercent: -14, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
          });
        }

        // Lists: each row reveals once as it enters (no scrub, so rows never sit half-faded)
        q('[data-scrub-list]').forEach((list) => {
          const rows = Array.from(list.children);
          gsap.set(rows, { opacity: 0.2, y: 14 });
          ScrollTrigger.batch(rows, {
            start: 'top 90%',
            once: true,
            onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power2.out', overwrite: true }),
          });
        });
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    // Lazy images change layout height: recalc trigger positions when they arrive
    const onImg = (e) => { if (e.target.tagName === 'IMG') debounced(); };
    let timer;
    const debounced = () => { clearTimeout(timer); timer = setTimeout(refresh, 200); };
    root.addEventListener('load', onImg, true);
    const t = setTimeout(refresh, 700);
    // Any layout growth (lazy media, fonts, accordions) re-measures trigger positions
    const ro = new ResizeObserver(debounced);
    ro.observe(root);
    // Safety sweep: when scrolling settles, reveal anything already passed but still hidden
    let sweepT;
    const sweep = () => {
      clearTimeout(sweepT);
      sweepT = setTimeout(() => {
        const vh = window.innerHeight;
        const late = q('[data-anim="fade-up"], [data-anim="fade"], [data-anim-stagger] > *, [data-scrub-list] > *').filter((el) => el.getBoundingClientRect().top < vh && parseFloat(getComputedStyle(el).opacity) < 0.5 && !gsap.isTweening(el));
        if (late.length) gsap.to(late, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, overwrite: true });
        q('[data-split] .split-inner').forEach((el) => { if (el.getBoundingClientRect().top < vh && gsap.getProperty(el, 'yPercent') === 0 && el.style.transform.includes('110')) gsap.to(el, { y: '0%', duration: 0.8 }); });
        q('[data-anim="clip"]').forEach((el) => { if (el.getBoundingClientRect().top < vh && getComputedStyle(el).clipPath.includes('100%') && !gsap.isTweening(el)) gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.out' }); });
      }, 220);
    };
    window.addEventListener('scroll', sweep, { passive: true });

    return () => {
      clearTimeout(t);
      clearTimeout(timer);
      clearTimeout(sweepT);
      ro.disconnect();
      window.removeEventListener('scroll', sweep);
      root.removeEventListener('load', onImg, true);
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  return <div ref={ref} className="motion-scope">{children}</div>;
}
