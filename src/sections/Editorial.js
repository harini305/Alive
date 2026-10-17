import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import { contentImages } from '@/lib/sections';
import { frameRatio, hasMedia, mediaWidth } from '@/lib/media';
import { MIN_CARD_WIDTH } from '@/lib/imagePick';
import { Flow, toFlow, splitHead, textLength, Text } from './Rich';
import s from './Editorial.module.css';

const SURFACES = ['surface-ivory', 'surface-paper', 'surface-sand'];

// approximate rendered rows of a flow item, used to keep the column beside a photo short
const rowsOf = (it) => {
  if (it.kind === 'p') return Math.ceil((it.text || '').length / 80);
  if (it.kind === 'list' || it.kind === 'checks') return it.items.reduce((n, li) => n + Math.ceil((li.text || '').length / 70), 0);
  return it.kind === 'h' ? 2 : 1;
};
const LONG_ROWS = 18;   // beyond this the copy no longer fits beside one photograph
const BESIDE_ROWS = 10; // what stays beside the photo; the rest runs full width below

/**
 * The general-purpose editorial layout for captured sections. The composition is chosen from
 * the content itself: amount of copy, number of photographs, and the section's position
 * (alternating sides and surfaces so long pages keep a rhythm).
 */
export default function Editorial({ section, route, index = 0, surface, anchor }) {
  const images = contentImages(section.blocks);
  const { title, subtitle, body } = splitHead(section.blocks);
  const flow = toFlow(body);
  const len = textLength(section.blocks);
  const surf = surface || SURFACES[index % 3];
  const flip = index % 2 === 1;

  const Head = title ? (
    <header className={s.head}>
      {/* a section title is always an h2 under the page's h1, so the outline never skips a level */}
      <SplitText as="h2" className={title.level >= 3 ? s.titleSm : s.title} text={title.text} />
      {subtitle && <p className={s.subtitle} data-anim="fade-up"><Text text={subtitle.text} links={subtitle.links} /></p>}
      <span className={s.rule} data-line aria-hidden="true" />
    </header>
  ) : null;

  const Body = (
    <div className={`flow ${s.body}`} data-anim="fade-up">
      <Flow items={flow} route={route} />
    </div>
  );

  // No photography: centred essay for short copy, two-column for long copy
  if (!images.length) {
    if (len < 750 || !title) {
      return (
        <section className={`section ${surf} ${s.centered}`} id={anchor}>
          <div className="container container-narrow">
            {Head}
            {Body}
          </div>
        </section>
      );
    }
    return (
      <section className={`section ${surf}`} id={anchor}>
        <div className={`container ${s.columns}`}>
          <div className={s.columnsHead}>{Head}</div>
          {Body}
        </div>
      </section>
    );
  }

  // the main frame prefers a photo large enough to fill it; its shape follows the photo
  const big = images.findIndex((im) => mediaWidth(im.file) >= 900);
  const ordered = big > 0 ? [images[big], ...images.filter((_, i) => i !== big)] : images;
  const [main, second, ...rest] = ordered;
  const more = rest.filter((im) => !hasMedia(im.file) || mediaWidth(im.file) >= MIN_CARD_WIDTH);
  const mainW = mediaWidth(main.file);
  const frame = {
    '--ar': frameRatio(main.file),
    '--ar-m': frameRatio(main.file, 1, 16 / 9, 4 / 3),
    // never enlarge a small original past its own width
    ...(mainW ? { maxWidth: `${mainW}px` } : {}),
  };

  // very long copy (e.g. 40-row inclusion lists): keep a short opening beside the photo and run
  // the rest full width below in two columns, instead of leaving half the screen empty
  const totalRows = flow.reduce((n, it) => n + rowsOf(it), 0);
  let beside = flow;
  let below = [];
  if (totalRows > LONG_ROWS) {
    let rows = 0;
    let cut = 0;
    while (cut < flow.length && rows + rowsOf(flow[cut]) <= BESIDE_ROWS) { rows += rowsOf(flow[cut]); cut++; }
    beside = flow.slice(0, cut);
    below = flow.slice(cut);
    // a long list that doesn't fit whole is split, so the column beside the photo is filled
    // with its first points instead of leaving a one-line intro next to a tall photo
    const next = below[0];
    if (next && (next.kind === 'list' || next.kind === 'checks')) {
      let k = 0;
      while (k < next.items.length && rows + Math.ceil((next.items[k].text || '').length / 70) <= BESIDE_ROWS + 2) {
        rows += Math.ceil((next.items[k].text || '').length / 70);
        k++;
      }
      // a list only splits when a real run of it (3+ points) fits beside the photo; one lone point
      // beside the photo with the rest below reads as a broken list, so the whole list moves below
      if (k >= 3) {
        beside = [...beside, { ...next, items: next.items.slice(0, k) }];
        below = next.items.length > k ? [{ ...next, items: next.items.slice(k) }, ...below.slice(1)] : below.slice(1);
      }
    }
    // a short remainder reads better staying with the rest of the copy than as its own band
    // (only a long run of points, e.g. 40-row inclusion lists, is worth moving below the photo)
    if (below.reduce((n, it) => n + rowsOf(it), 0) <= 14) { beside = flow; below = []; }
  }
  const besideLen = beside.reduce((n, it) => n + (it.text || '').length + (it.items || []).reduce((m, li) => m + (li.text || '').length, 0), 0);
  const tall = besideLen > 1400;
  return (
    <section className={`section ${surf}`} id={anchor}>
      <div className={`container ${s.split} ${flip ? s.flip : ''} ${tall ? s.tall : ''} ${second ? s.collage : ''} ${!tall && !second ? s.fit : ''}`}>
        <div className={s.mediaCol}>
          <div className={s.mediaSticky}>
            <figure className={`media ${s.mainMedia} ${second ? s.withSecond : ''}`} style={frame} data-anim="clip" data-clip-from={flip ? 'right' : 'left'}>
              <div className="media-parallax" data-parallax="10" style={{ height: '100%' }}>
                <Img file={main.file} alt={main.alt} sizes="(min-width: 900px) min(46vw, 660px), 92vw" />
              </div>
            </figure>
            {second && (
              <figure className={`media ${s.secondMedia}`} data-anim="clip" data-drift="30">
                <Img file={second.file} alt={second.alt} sizes="(min-width: 900px) min(16vw, 240px), 50vw" />
              </figure>
            )}
          </div>
        </div>
        <div className={s.textCol}>
          {Head}
          {beside.length > 0 && (
            <div className={`flow ${s.body}`} data-anim="fade-up">
              <Flow items={beside} route={route} />
            </div>
          )}
        </div>
      </div>
      {below.length > 0 && (
        <div className="container">
          <div className={`flow ${s.below}`} data-anim="fade-up">
            <Flow items={below} route={route} splitLong={false} />
          </div>
        </div>
      )}
      {more.length > 0 && (
        <div className={`container ${s.strip}`} data-anim-stagger>
          {more.slice(0, 6).map((im) => (
            <figure key={im.file} className="media">
              <Img file={im.file} alt={im.alt} sizes="(min-width: 900px) 24vw, 50vw" />
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
