'use client';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { Arrow } from './Icons';
import s from './FaqBrowser.module.css';

const SITE_RE = /(https?:\/\/)?www\.aliveluxuryretreats\.com(\/[\w\-\/]*)?/g;

function Linkify({ text }) {
  const parts = [];
  let last = 0;
  text.replace(SITE_RE, (m, _p, path, idx) => {
    parts.push(text.slice(last, idx));
    parts.push(<Link key={idx} href={path || '/'} className="text-link">{m.replace(/^https?:\/\//, '')}</Link>);
    last = idx + m.length;
    return m;
  });
  parts.push(text.slice(last));
  return <>{parts}</>;
}

function Answer({ blocks, pdf }) {
  return (
    <div className={`flow ${s.answer}`}>
      {blocks.map((b, i) => {
        if (b.type === 'ul') return <ul key={i} className="dotlist">{b.items.map((t, j) => <li key={j}><Linkify text={t} /></li>)}</ul>;
        if (b.type === 'h') return <h4 key={i} className={s.answerH}>{b.text}</h4>;
        if (/download a pdf of this here/i.test(b.text) || /download the full retreat pricing guide/i.test(b.text)) {
          return <p key={i}><a href={pdf} target="_blank" rel="noopener" className="text-link">{b.text.replace(/>$/, '')}</a></p>;
        }
        return <p key={i}><Linkify text={b.text} /></p>;
      })}
    </div>
  );
}

function Item({ id, item, open, onToggle, pdf, index }) {
  const panel = useRef(null);
  const first = useRef(true);
  // closed panels are collapsed in the server HTML too, so nothing shifts on hydration.
  // The style object never changes after mount, so React leaves GSAP's inline styles alone.
  const initialStyle = useRef(open ? undefined : { height: 0, opacity: 0, visibility: 'hidden' });
  useLayoutEffect(() => {
    const el = panel.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (first.current) { first.current = false; gsap.set(el, open ? { height: 'auto', autoAlpha: 1 } : { height: 0, autoAlpha: 0 }); return; }
    if (open) gsap.fromTo(el, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: 'expo.out' });
    else gsap.to(el, { height: 0, autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: 'power2.inOut' });
  }, [open]);
  return (
    <div className={`${s.item} ${open ? s.open : ''}`}>
      <h3 className={s.qWrap}>
        <button type="button" id={`${id}-q`} aria-expanded={open} aria-controls={`${id}-a`} className={s.q} onClick={onToggle}>
          <span className={s.qText}>{item.q}</span>
          <span className={s.icon} aria-hidden="true" />
        </button>
      </h3>
      <div ref={panel} id={`${id}-a`} className={s.panel} style={initialStyle.current}>
        <Answer blocks={item.a} pdf={pdf} />
      </div>
    </div>
  );
}

export default function FaqBrowser({ cats, pdf }) {
  const [cat, setCat] = useState(0);
  const [open, setOpen] = useState('0-0');
  const [query, setQuery] = useState('');
  const list = useRef(null);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    const out = [];
    cats.forEach((c, ci) => c.items.forEach((it, ii) => {
      const hay = (it.q + ' ' + it.a.map((b) => b.text || b.items?.join(' ')).join(' ')).toLowerCase();
      if (hay.includes(q)) out.push({ ci, ii, it, cat: c.name });
    }));
    return out;
  }, [q, cats]);

  // deep links: #faq-<cat>-<item>, ?q=<search>
  const restored = useRef(false);
  useEffect(() => {
    const m = window.location.hash.match(/^#faq-(\d+)-(\d+)$/);
    if (m) { setCat(+m[1]); setOpen(`${m[1]}-${m[2]}`); }
    const sq = new URLSearchParams(window.location.search).get('q');
    if (sq) setQuery(sq);
    restored.current = true;
  }, []);

  // keep the search in the URL so it survives reloads and can be shared
  useEffect(() => {
    if (!restored.current) return;
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', query.trim()); else url.searchParams.delete('q');
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
  }, [q, query]);

  useEffect(() => {
    if (!list.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(list.current.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.6, ease: 'power3.out' });
  }, [cat, q]);

  const onTabKey = (e, i) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = cats.length;
    const next = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    setCat(next);
    document.getElementById(`faq-tab-${next}`)?.focus();
  };

  return (
    <div className={s.layout}>
      <aside className={s.side}>
        <label className={s.search}>
          <span className="sr-only">Search the FAQ</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input type="search" name="q" placeholder="Search questions…" autoComplete="off" spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div role="tablist" aria-orientation="vertical" aria-label="FAQ categories" className={s.tabs}>
          {cats.map((c, i) => (
            <button
              key={c.name}
              id={`faq-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={!q && cat === i}
              aria-controls="faq-panel"
              tabIndex={cat === i ? 0 : -1}
              className={s.tab}
              onKeyDown={(e) => onTabKey(e, i)}
              onClick={() => { setQuery(''); setCat(i); setOpen(`${i}-0`); }}
            >
              <span className={s.tabName}>{c.name}</span>
            </button>
          ))}
        </div>
        <a href={pdf} target="_blank" rel="noopener" className={`btn btn-dark ${s.pdf}`}>Download Packages PDF<Arrow /></a>
      </aside>

      <div id="faq-panel" role="tabpanel" aria-labelledby={q ? undefined : `faq-tab-${cat}`} aria-label={q ? 'Search results' : undefined} className={s.panelCol}>
        <p className={s.panelTitle}>{q ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”` : cats[cat].name}</p>
        <div ref={list}>
          {q
            ? results.map((r, k) => (
              <Item key={`${r.ci}-${r.ii}`} id={`faq-${r.ci}-${r.ii}`} index={k} item={r.it} pdf={pdf} open={open === `${r.ci}-${r.ii}`} onToggle={() => setOpen(open === `${r.ci}-${r.ii}` ? null : `${r.ci}-${r.ii}`)} />
            ))
            : cats[cat].items.map((it, ii) => (
              <Item key={`${cat}-${ii}`} id={`faq-${cat}-${ii}`} index={ii} item={it} pdf={pdf} open={open === `${cat}-${ii}`} onToggle={() => setOpen(open === `${cat}-${ii}` ? null : `${cat}-${ii}`)} />
            ))}
          {q && results.length === 0 && <p className={s.empty}>No questions match that search. Try another word, or <Link href="/contact" className="text-link">contact the team</Link>.</p>}
        </div>
      </div>
    </div>
  );
}
