'use client';
import { useState } from 'react';
import { PlayIcon } from './Icons';
import { clientMedia } from '@/lib/clientMedia';
import { ASSETS } from '@/lib/site';

const mark = clientMedia(ASSETS.logoWhite);

// Click-to-load embed: no YouTube requests or cookies until the visitor presses play.
export default function YouTube({ id, title }) {
  const [play, setPlay] = useState(false);
  return (
    <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#1b1a17', overflow: 'hidden', border: '1px solid var(--line-dark)' }}>
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          aria-label={`Play video: ${title}`}
          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', gap: 18, alignContent: 'center', width: '100%', border: 0, cursor: 'pointer', color: 'var(--champagne)', background: 'radial-gradient(circle at 50% 45%, #3a382f 0%, #1b1a17 70%)' }}
        >
          {mark && <img src={mark.smallest} alt="" width="90" height="90" style={{ opacity: 0.85 }} />}
          <span style={{ display: 'grid', placeItems: 'center', width: 74, height: 74, borderRadius: '50%', border: '1px solid var(--champagne)' }}><PlayIcon size={26} /></span>
          <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.14em', fontSize: '0.8rem' }}>Play video · YouTube</span>
        </button>
      )}
    </div>
  );
}
