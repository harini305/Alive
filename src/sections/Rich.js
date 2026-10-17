import Link from 'next/link';
import { Fragment } from 'react';
import { resolveHref, splitChecks, CHECK_RE, smartText } from '@/lib/sections';
import { Arrow } from '@/components/Icons';
import r from './Rich.module.css';

// lists longer than this are set in two columns so they don't run for screens in one narrow column
export const LONG_LIST = 10;

const SITE_RE = /https?:\/\/(?:www\.)?aliveluxuryretreats\.com(\/[^\s)]*)?/gi;

export function SmartLink({ href, children, className, newTab, ...rest }) {
  if (!href) return <span className={className}>{children}</span>;
  if (href.startsWith('/') && !href.startsWith('//') && !/\.(pdf|mp4)$/i.test(href)) return <Link href={href} className={className} {...rest}>{children}</Link>;
  const ext = /^https?:/.test(href) || /\.(pdf)$/i.test(href);
  return <a href={href} className={className} {...(ext || newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>{children}</a>;
}

/**
 * Text with the inline links captured from the source (block.links) and bare site URLs linked.
 * Plain runs and link labels get typographic quotes, ellipses and dashes (links are matched
 * against the raw text first, so they keep working).
 */
export function Text({ text, links }) {
  if (!text) return null;
  const parts = [];
  let rest = text;
  const all = [...(links || [])];
  let key = 0;
  while (rest) {
    let best = null;
    for (const l of all) {
      const i = rest.indexOf(l.text);
      if (i >= 0 && (!best || i < best.i)) best = { i, l };
    }
    SITE_RE.lastIndex = 0;
    const m = SITE_RE.exec(rest);
    if (m && (!best || m.index < best.i)) {
      parts.push(<Fragment key={key++}>{smartText(rest.slice(0, m.index))}</Fragment>);
      const local = (m[1] || '/').replace(/\/$/, '') || '/';
      parts.push(<SmartLink key={key++} href={local} className="text-link">{m[0].replace(/^https?:\/\//, '')}</SmartLink>);
      rest = rest.slice(m.index + m[0].length);
      continue;
    }
    if (!best) { parts.push(<Fragment key={key++}>{smartText(rest)}</Fragment>); break; }
    parts.push(<Fragment key={key++}>{smartText(rest.slice(0, best.i))}</Fragment>);
    parts.push(<SmartLink key={key++} href={best.l.href} className="text-link" newTab={best.l.newTab}>{smartText(best.l.text)}</SmartLink>);
    rest = rest.slice(best.i + best.l.text.length);
    all.splice(all.indexOf(best.l), 1);
  }
  return <>{parts}</>;
}

/**
 * A paragraph that becomes a ✓ checklist when the source ran several ticked items together
 * in one text box ("Your Private Luxury Space ✓ Enjoy … ✓ With …").
 */
export function Para({ text, links, className, ...rest }) {
  const checks = text && splitChecks(text);
  if (!checks) return <p className={className} {...rest}><Text text={text} links={links} /></p>;
  const lead = text.trim().search(CHECK_RE) > 0 ? text.slice(0, text.search(CHECK_RE)).trim() : null;
  const items = lead ? checks.slice(1) : checks;
  return (
    <>
      {lead && <p className={className} {...rest}><Text text={lead} links={links} /></p>}
      <ul className={`checklist ${items.length > LONG_LIST ? r.cols : ''}`} {...(lead ? {} : rest)}>
        {items.map((t, j) => <li key={j}><Text text={t} links={links} /></li>)}
      </ul>
    </>
  );
}

export function CtaLink({ link, route, variant = 'btn', className = '' }) {
  const href = resolveHref(link, route);
  const label = smartText(link.text.replace(/\s*>+\s*$/, '').trim());
  if (variant === 'arrow') {
    return <SmartLink href={href} className={`link-arrow ${className}`}>{label}<Arrow className="" /></SmartLink>;
  }
  return <SmartLink href={href} className={`btn ${className}`}>{label}<Arrow /></SmartLink>;
}

/**
 * Groups raw blocks into renderable flow items: paragraphs, bullet lists, ✓ checklists,
 * sub-headings and CTA rows. Images are excluded (layouts place them).
 */
export function toFlow(blocks) {
  const flow = [];
  const push = (item) => flow.push(item);
  for (const b of blocks) {
    const last = flow[flow.length - 1];
    if (b.t === 'img' || b.t === 'label' || b.t === 'field' || b.t === 'btn') continue;
    if (b.t === 'link') {
      if (last?.kind === 'cta') last.links.push(b); else push({ kind: 'cta', links: [b] });
      continue;
    }
    if (b.t === 'li') {
      const checks = splitChecks(b.text);
      if (checks) { if (last?.kind === 'checks') last.items.push(...checks.map((t) => ({ text: t }))); else push({ kind: 'checks', items: checks.map((t) => ({ text: t })) }); continue; }
      if (last?.kind === 'list') last.items.push(b); else push({ kind: 'list', items: [b] });
      continue;
    }
    if (b.t === 'p') {
      const checks = splitChecks(b.text);
      if (checks) {
        const lead = b.text.trim().search(CHECK_RE) > 0 ? b.text.slice(0, b.text.search(CHECK_RE)).trim() : null;
        if (lead) push({ kind: 'p', text: lead, links: b.links });
        const items = (lead ? checks.slice(1) : checks).map((t) => ({ text: t, links: b.links }));
        if (last?.kind === 'checks' && !lead) last.items.push(...items); else push({ kind: 'checks', items });
        continue;
      }
      push({ kind: 'p', text: b.text, links: b.links });
      continue;
    }
    if (b.t === 'h') {
      const checks = splitChecks(b.text);
      // h4/h5/h6 used as body copy on the source when long (unless it is an inline ✓ list)
      if (!(checks && checks.length > 1) && ((b.level >= 4 && b.text.length > 90) || b.text.length > 160)) { push({ kind: 'p', text: b.text, links: b.links }); continue; }
      if (checks && checks.length > 1) {
        const lead = b.text.search(CHECK_RE) > 0 ? b.text.slice(0, b.text.search(CHECK_RE)).trim() : null;
        if (lead) push({ kind: 'h', level: b.level, text: lead });
        push({ kind: 'checks', items: (lead ? checks.slice(1) : checks).map((t) => ({ text: t })) });
        continue;
      }
      push({ kind: 'h', level: b.level, text: b.text, links: b.links });
    }
  }
  return flow;
}

/**
 * `base` is the heading level that contains this flow (2 under a section title, 3 inside a card):
 * sub-headings never skip a level, whatever level the source used. `splitLong` sets lists of more
 * than LONG_LIST items in two columns (off when the container already lays out in columns).
 */
export function Flow({ items, route, ctaVariant = 'btn', dark = false, base = 2, splitLong = true }) {
  let prev = base;
  const cols = (n) => (splitLong && n > LONG_LIST ? r.cols : '');
  return items.map((it, i) => {
    switch (it.kind) {
      // one body size for every paragraph: emphasis on the source is not set larger
      case 'p':
        return <p key={i}><Text text={it.text} links={it.links} /></p>;
      case 'list':
        return <ul key={i} className={`dotlist ${cols(it.items.length)}`}>{it.items.map((li, j) => <li key={j}><Text text={li.text} links={li.links} /></li>)}</ul>;
      case 'checks':
        return <ul key={i} className={`checklist flow-checks ${cols(it.items.length)}`}>{it.items.map((li, j) => <li key={j}><Text text={li.text} links={li.links} /></li>)}</ul>;
      case 'h': {
        const lvl = Math.min(6, Math.max(base + 1, Math.min(it.level, prev + 1)));
        prev = lvl;
        const Tag = `h${lvl}`;
        return <Tag key={i} className={`flow-h flow-h${it.level}`}><Text text={it.text} links={it.links} /></Tag>;
      }
      case 'cta':
        return (
          <div key={i} className="flow-cta">
            {it.links.map((l, j) => <CtaLink key={j} link={l} route={route} variant={j === 0 && ctaVariant === 'btn' ? 'btn' : 'arrow'} className={j === 0 && dark ? '' : j === 0 ? 'btn-dark' : ''} />)}
          </div>
        );
      default:
        return null;
    }
  });
}

/** Splits a section into title (first heading), optional subtitle (heading right after) and the rest. */
export function splitHead(blocks) {
  const noImg = blocks.filter((b) => b.t !== 'img');
  let title = null, subtitle = null, start = 0;
  if (noImg[0]?.t === 'h' && noImg[0].text.length < 160) {
    title = noImg[0];
    start = 1;
    if (noImg[1]?.t === 'h' && noImg[1].level > title.level && noImg[1].text.length < 200 && !CHECK_RE.test(noImg[1].text)) { subtitle = noImg[1]; start = 2; }
  }
  return { title, subtitle, body: noImg.slice(start) };
}

export const textLength = (blocks) => blocks.reduce((n, b) => n + (b.text ? b.text.length : 0), 0);
