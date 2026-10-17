'use client';
import { useEffect, useState } from 'react';
import s from './LegalToc.module.css';

/**
 * Sticky contents list; the active entry follows the reader. An IntersectionObserver watches the
 * top 35% of the viewport, so nothing is measured on scroll frames.
 */
export default function LegalToc({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id));
    const passed = items.map(() => false);
    // headings are siblings, so keep the last one that has passed the 35% line active
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = els.indexOf(e.target);
        if (i >= 0) passed[i] = e.isIntersecting || e.boundingClientRect.top < 0;
      }
      const last = passed.lastIndexOf(true);
      setActive(items[Math.max(0, last)]?.id);
    }, { rootMargin: '0px 0px -65% 0px', threshold: 0 });
    els.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className={s.toc} aria-label="Contents" data-lenis-prevent>
      <button type="button" className={s.toggle} aria-expanded={open} onClick={() => setOpen((o) => !o)}>Contents <span aria-hidden="true">{open ? '−' : '+'}</span></button>
      <ol className={`${s.list} ${open ? s.open : ''}`}>
        {items.map((it) => (
          <li key={it.id} className={it.level === 3 ? s.sub : undefined}>
            <a href={`#${it.id}`} className={active === it.id ? s.active : undefined} aria-current={active === it.id ? 'location' : undefined} onClick={() => setOpen(false)}>{it.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
