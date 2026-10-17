import Link from 'next/link';
import PageHeadMedia from '@/components/PageHeadMedia';
import NdaForm from '@/components/NdaForm';
import LegalToc from '@/components/LegalToc';
import { Text } from '@/sections/Rich';
import { CONTACT } from '@/lib/site';
import s from './Legal.module.css';

const RESIDUE = new Set([':', 'Hours', 'Minutes', 'AM', 'PM', '--']);
// Sub-clause titles were captured as plain paragraphs ("Use of Confidential Information.");
// short Title Case lines ending in a full stop are promoted to headings so they reach the TOC.
const isClauseTitle = (b) => {
  if (b.t !== 'p') return false;
  const t = b.text.trim();
  if (t.length >= 60 || !/^[A-Z][^.]*\.$/.test(t) || /[,;:]/.test(t)) return false;
  const words = t.slice(0, -1).split(/\s+/);
  return words.length <= 8 && words.every((w) => w.length <= 3 || /^[A-Z]/.test(w));
};
const slug = (t, i) => `s-${i}-${t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)}`;

/**
 * Long-form legal documents (Booking Conditions, NDA, Privacy Policy), carried over verbatim.
 * Numbered headings become a sticky table of contents.
 */
export default function Legal({ page }) {
  const isNda = page.route === '/nda';
  let blocks = page.sections.flatMap((s) => s.blocks).filter((b) => b.t !== 'field' && b.t !== 'img' && !(b.t === 'btn'));
  // NDA: the signature form is rebuilt below, so its labels and widget residue are not repeated as text
  if (isNda) {
    const sigText = 'By ticking this box I the RECEIVING PARTY';
    let seenSig = false;
    blocks = blocks.filter((b) => {
      if (b.t === 'label') { if (b.text.startsWith(sigText)) seenSig = true; return false; }
      if (seenSig) return false;
      return !(b.t === 'p' && RESIDUE.has(b.text));
    });
  }
  const titleBlock = blocks.find((b) => b.t === 'h' && b.level === 1 && !/^\d/.test(b.text.replace(/[​]/g, ''))) || blocks.find((b) => b.t === 'h');
  const title = titleBlock?.text.trim();
  // a clause title nests under the previous section heading (h3), or is a section itself (h2) when none precedes it
  let seenH2 = false;
  const body = blocks.filter((b) => b !== titleBlock).map((b) => {
    if (b.t === 'h' && b.level <= 2) seenH2 = true;
    return isClauseTitle(b) ? { t: 'h', level: seenH2 ? 3 : 2, clause: true, text: b.text.trim() } : b;
  });
  const toc = [];
  body.forEach((b, i) => {
    if (b.clause) toc.push({ id: slug(b.text, i), text: b.text.replace(/\.$/, ''), level: b.level });
    else if (b.t === 'h' && b.level <= 2) toc.push({ id: slug(b.text, i), text: b.text, level: 2 });
  });
  const words = blocks.reduce((n, b) => n + (b.text ? b.text.split(/\s+/).length : 0), 0);

  return (
    <>
      <section className={s.hero}>
        <div className="container page-head"><div className="page-head-text">
          <h1 className={s.title} data-split="hero">
            <span className="sr-only">{title}</span>
            <span className="split-line" aria-hidden="true"><span className="split-word"><span className="split-inner">{title}</span></span></span>
          </h1>
          {isNda && <p className={s.skip} data-hero-in><a href="#sign" className="link-arrow">Skip to signature</a></p>}
          <p className={s.meta} data-hero-in>{Math.round(words / 230)} min read · {toc.length} sections · Questions? <a href={`mailto:${CONTACT.email}`} className="text-link">{CONTACT.email}</a></p>
        </div>
          <PageHeadMedia route={page.route} />
        </div>
      </section>
      <section className={`section-sm surface-paper ${s.doc}`}>
        <div className={`container ${s.grid}`}>
          {toc.length > 2 && <LegalToc items={toc} />}
          <article className={`prose ${s.body}`}>
            {body.map((b, i) => {
              if (b.t === 'h') {
                const Tag = b.level <= 2 ? 'h2' : 'h3';
                const isSub = /^\d+\.\d+/.test(b.text);
                return <Tag key={i} id={b.level <= 2 || b.clause ? slug(b.text, i) : undefined} className={isSub || b.clause ? s.h3 : s.h2}>{b.text}</Tag>;
              }
              if (b.t === 'li') return <ul key={i} className="dotlist"><li><Text text={b.text} links={b.links} /></li></ul>;
              if (b.t === 'link') return <p key={i}><Link href={b.href || '/contact'} className="text-link">{b.text}</Link></p>;
              const t = b.text;
              const short = t.length < 70 && /^[A-Z0-9 .,'’&()\-:]+$/.test(t) && /[A-Z]{3}/.test(t);
              return short ? <p key={i} className={s.caps}>{t}</p> : <p key={i}><Text text={t} links={b.links} /></p>;
            })}
          </article>
        </div>
      </section>
      {isNda && (
        <section className="section surface-sand" id="sign">
          <div className="container container-narrow">
            <h2 className={s.signTitle}>Sign The Agreement</h2>
            <NdaForm />
          </div>
        </section>
      )}
    </>
  );
}
