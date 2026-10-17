'use client';
import { useEffect, useRef, useState } from 'react';
import { PlayIcon } from '@/components/Icons';
import s from './BgVideo.module.css';

/**
 * Decorative background video with a visible pause / play control (WCAG 2.2.2).
 * It only starts by itself on larger screens, without reduced motion and without data saver;
 * otherwise the poster shows and the same button starts it on request.
 * The video wrapper is aria-hidden; the control sits outside it so it stays reachable.
 */
export default function BgVideo({ src, poster, preload = 'metadata', wrapClassName, wrapProps, videoClassName, btnClassName }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 767px)').matches;
    const saveData = !!navigator.connection?.saveData;
    if (reduce || small || saveData) return;
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else { v.pause(); setPlaying(false); }
  };

  return (
    <>
      <div className={wrapClassName} aria-hidden="true" {...wrapProps}>
        <video ref={ref} className={videoClassName} muted loop playsInline preload={preload} poster={poster} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)}>
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <button
        type="button"
        className={`${s.toggle} ${btnClassName || ''}`}
        onClick={toggle}
        aria-label="Pause background video"
        aria-pressed={!playing}
        title={playing ? 'Pause video' : 'Play video'}
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
        ) : (
          <PlayIcon size={20} />
        )}
      </button>
    </>
  );
}
