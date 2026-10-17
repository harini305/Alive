import Hero from '@/sections/Hero';
import FaqBrowser from '@/components/FaqBrowser';
import { getFaq } from '@/lib/content';
import { PDFS } from '@/lib/site';
import { Callback } from '@/sections/Blocks';
import s from './Faq.module.css';

// Words that legitimately contain an inner capital and must not be treated as run-together text.
const KEEP = ['YouTube', 'WhatsApp', 'LinkedIn', 'iPhone', 'McDonald', 'PayPal', 'TikTok', 'IVs'];

/**
 * The FAQ app answers were captured as run-together text (paragraph breaks lost, 07 §F).
 * Restore the visual structure without changing a word: break where a sentence end runs straight
 * into the next capitalised word, and turn "•" runs into bullet lists.
 */
function structure(lines) {
  const out = [];
  for (const raw of lines) {
    let t = raw;
    KEEP.forEach((w, i) => { t = t.split(w).join(`\u0000${i}\u0000`); });
    t = t.replace(/([a-z0-9\.\!\?\)\:%’'”])(?=[A-Z][a-z])/g, '$1\n').replace(/\s*•\s*/g, '\n• ');
    t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => KEEP[+i]);
    const parts = t.split('\n').map((x) => x.trim()).filter(Boolean);
    for (const p of parts) {
      if (p.startsWith('• ')) {
        const last = out[out.length - 1];
        if (last?.type === 'ul') last.items.push(p.slice(2)); else out.push({ type: 'ul', items: [p.slice(2)] });
      } else if (p.length < 64 && !/[.!?:]$/.test(p) && !/^(OR|Yes|No)$/i.test(p)) {
        out.push({ type: 'h', text: p });
      } else {
        out.push({ type: 'p', text: p });
      }
    }
  }
  // a "heading" that is not followed by content reads better as a paragraph
  return out.map((b, i) => (b.type === 'h' && (!out[i + 1] || out[i + 1].type === 'h') ? { type: 'p', text: b.text } : b));
}

export default function Faq({ page }) {
  const cats = getFaq().map((c) => ({ name: c.name, items: c.items.map((q) => ({ q: q.q, a: structure(q.a) })) }));
  const total = cats.reduce((n, c) => n + c.items.length, 0);
  const heroBlocks = page.sections[0].blocks.slice(0, 2);
  return (
    <>
      <Hero blocks={heroBlocks} route={page.route} variant="plain" />
      <section className={`section-sm surface-ivory ${s.wrap}`}>
        <div className="container">
          <FaqBrowser cats={cats} pdf={PDFS.packages.href} />
        </div>
      </section>
      <Callback section={{ blocks: [{ t: 'h', level: 2, text: 'Request a Confidential Call Back' }, { t: 'p', text: 'Your dedicated client manager is available to answer every question privately and help you understand exactly what your program would look like.' }, { t: 'p', text: 'No obligation. Complete confidentiality.' }] }} route={page.route} />
    </>
  );
}
