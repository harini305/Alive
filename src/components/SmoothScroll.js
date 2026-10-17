'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Inertial wheel scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger animations stay in
 * sync. Touch scrolling stays native; disabled entirely for reduced-motion users.
 * Exposed as window.__lenis so overlays (mobile menu) can pause it.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // anchor offset: Lenis already subtracts html's scroll-padding-top (calc(var(--header-h) + 16px)),
    // so it tracks the live header height; a fixed offset here would double-count it.
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true, anchors: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  // new page: jump to top instantly (no smooth travel across the old page)
  useEffect(() => {
    if (window.location.hash) return;
    window.__lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
