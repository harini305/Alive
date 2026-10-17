'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import s from './SiteSearch.module.css';

export default function SiteSearch({ index }) {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('All');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('q');
    if (p) setQ(p);
  }, []);
  const kinds = ['All', ...new Set(index.map((i) => i.kind))];
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return index.filter((i) => (kind === 'All' || i.kind === kind) && (!t || `${i.title} ${i.desc || ''}`.toLowerCase().includes(t)));
  }, [q, kind, index]);
  return (
    <div className={s.wrap}>
      <label className={s.box}>
        <span className="sr-only">Site search</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        <input type="search" name="q" placeholder="Search pages, posts…" autoComplete="off" spellCheck={false} value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className={s.filters} role="group" aria-label="Filter results">
        {kinds.map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k} <span className="tnum">({k === 'All' ? index.length : index.filter((i) => i.kind === k).length})</span>
          </button>
        ))}
      </div>
      <p className={s.count} aria-live="polite">{results.length} result{results.length === 1 ? '' : 's'}</p>
      <ul className={s.list}>
        {results.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className={s.item}>
              <span className={s.kind}>{r.kind}</span>
              <span className={s.title}>{r.title}</span>
              {r.desc && r.desc !== r.title && <span className={s.desc}>{r.desc}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
