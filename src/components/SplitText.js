import { Fragment } from 'react';
import { smartText } from '@/lib/sections';

/**
 * Renders a heading split into words, each wrapped for a masked rise animation.
 * The animated words are aria-hidden; a visually hidden copy of the full string is read instead
 * (aria-label is not reliably announced on paragraphs, so the text itself is exposed).
 * mode: 'scroll' (default) animates when scrolled into view, 'hero' plays on load.
 */
export default function SplitText({ as: Tag = 'h2', text, className, mode = 'scroll', delay, ...rest }) {
  if (!text) return null;
  const clean = smartText(String(text));
  // a standalone dash stays glued to the previous word so a line never starts with "—"
  const words = clean.split(/\s+/).filter(Boolean).reduce((acc, w) => {
    if (/^[-–—]$/.test(w) && acc.length) acc[acc.length - 1] += ' ' + w;
    else acc.push(w);
    return acc;
  }, []);
  return (
    <Tag className={className} data-split={mode} data-delay={delay} {...rest}>
      <span className="sr-only">{clean}</span>
      <span aria-hidden="true" className="split-line">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="split-word"><span className="split-inner">{w}</span></span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
