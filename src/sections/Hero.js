import Img from '@/components/Img';
import PageHeadMedia from '@/components/PageHeadMedia';
import SplitText from '@/components/SplitText';
import BgVideo from './BgVideo';
import { frameRatio } from '@/lib/media';
import { CtaLink, Text } from './Rich';
import s from './Hero.module.css';

/**
 * Page hero built from the captured first section: eyebrow headings before the H1,
 * the H1, the sub-headline(s) after it, and the original CTA links.
 * variant 'image'  full-bleed photograph with layered type (dark header overlay)
 * variant 'split'  text + framed photograph, ivory background (pages with a portrait/utility hero)
 * variant 'plain'  typographic only (legal, utility pages)
 */
export function heroParts(blocks) {
  const h1i = blocks.findIndex((b) => b.t === 'h' && b.level === 1);
  const before = blocks.slice(0, h1i).filter((b) => b.t === 'h' && b.text.length < 90);
  const after = blocks.slice(h1i + 1);
  const subs = after.filter((b) => (b.t === 'h' && b.level > 1) || b.t === 'p');
  const links = blocks.filter((b) => b.t === 'link');
  return { eyebrow: before.map((b) => b.text).join(' · ') || null, title: blocks[h1i]?.text || '', subs, links };
}

export default function Hero({ blocks, image, route, variant = 'image', eyebrow: eyebrowOverride, children, position, video, poster }) {
  const { eyebrow, title, subs, links } = heroParts(blocks);
  const eb = eyebrowOverride ?? eyebrow;
  const cleanTitle = title.replace(/\s+/g, ' ').trim();

  if (variant === 'plain' || (!image && !video)) {
    return (
      <section className={`${s.plain}`} data-hero>
        <div className="container page-head">
          <div className="page-head-text">
          <SplitText as="h1" mode="hero" className={s.plainTitle} text={cleanTitle} />
          {subs.length > 0 && (
            <div className={s.plainSubs} data-hero-in>
              {subs.map((b, i) => <p key={i} className={i === 0 ? 'lead' : ''}><Text text={b.text} links={b.links} /></p>)}
            </div>
          )}
          {links.length > 0 && <div className={s.ctas} data-hero-in>{links.map((l, i) => <CtaLink key={i} link={l} route={route} className={i ? 'btn-outline' : 'btn-dark'} />)}</div>}
          {children}
          </div>
          {route && <PageHeadMedia route={route} />}
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className={s.split} data-hero>
        <div className={`container ${s.splitGrid}`}>
          <div className={s.splitText}>
            <SplitText as="h1" mode="hero" className={s.splitTitle} text={cleanTitle} />
            {subs.map((b, i) => <p key={i} className={i === 0 ? `lead ${s.splitLead}` : s.splitSub} data-hero-in><Text text={b.text} links={b.links} /></p>)}
            {links.length > 0 && <div className={s.ctas} data-hero-in>{links.map((l, i) => <CtaLink key={i} link={l} route={route} className={i ? 'btn-outline' : 'btn-dark'} />)}</div>}
            {children}
          </div>
          {/* LCP image: visible from first paint (no clip reveal); frame follows the photo's shape */}
          <div className={`media ${s.splitMedia}`} data-anim="settle" style={{ '--ar': frameRatio(image.file), '--ar-m': frameRatio(image.file, 1, 16 / 9, 4 / 3) }}>
            <Img file={image.file} alt={image.alt} priority sizes="(min-width: 900px) min(45vw, 640px), 100vw" position={position} />
          </div>
        </div>
      </section>
    );
  }

  const [lead, ...rest] = subs;
  return (
    <section className={s.hero} data-hero data-hero-dark>
      {video ? (
        <BgVideo src={video} poster={poster} preload="metadata" wrapClassName={s.mediaWrap} wrapProps={{ 'data-hero-media': true }} videoClassName={s.video} btnClassName={s.videoToggle} />
      ) : (
        <div className={s.mediaWrap} data-hero-media>
          <Img file={image.file} alt={image.alt} priority sizes="100vw" position={position} />
        </div>
      )}
      <div className={s.shade} aria-hidden="true" />
      <div className={`container ${s.content}`} data-hero-content>
        <SplitText as="h1" mode="hero" className={s.title} text={cleanTitle} />
        <div className={s.bottom}>
          {lead && <p className={s.lead} data-hero-in><Text text={lead.text} links={lead.links} /></p>}
          {rest.map((b, i) => <p key={i} className={s.more} data-hero-in><Text text={b.text} links={b.links} /></p>)}
          {links.length > 0 && (
            <div className={s.ctas} data-hero-in>
              {links.map((l, i) => <CtaLink key={i} link={l} route={route} className={i ? 'btn-light' : ''} />)}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
