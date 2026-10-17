'use client';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import MotionScope from '@/components/MotionScope';

let firstLoad = true;

// Re-mounts on every navigation: a short veil lifts off the new page, then the page's own
// scroll animations take over (MotionScope).
export default function Template({ children }) {
  const veil = useRef(null);
  useLayoutEffect(() => {
    if (firstLoad) {
      firstLoad = false; // initial document load: hero animations handle the entrance
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(veil.current, { autoAlpha: 0 });
      return;
    }
    const tween = gsap.fromTo(veil.current, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.7, ease: 'power2.out', delay: 0.05 });
    return () => tween.kill();
  }, []);
  return (
    <>
      <div ref={veil} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'var(--ivory)', zIndex: 60, pointerEvents: 'none', visibility: 'hidden' }} />
      <MotionScope>{children}</MotionScope>
    </>
  );
}
