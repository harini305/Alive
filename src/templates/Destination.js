import Hero from '@/sections/Hero';
import RenderSections from '@/sections/Render';
import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import { Flow, toFlow, splitHead, Text } from '@/sections/Rich';
import { buildSections, heroImage, contentImages } from '@/lib/sections';
import { frameRatio, mediaWidth } from '@/lib/media';
import { MIN_CARD_WIDTH } from '@/lib/imagePick';
import s from './Destination.module.css';

const isList = (it) => it.kind === 'checks' || it.kind === 'list';

/**
 * One accommodation topic as a single aligned row: photo beside the heading and opening copy (the
 * photo takes the height of the copy), then any checklists full width below in a compact grid.
 */
function Feature({ section, route, flip }) {
  const images = contentImages(section.blocks);
  const { title, subtitle, body } = splitHead(section.blocks);
  const flow = toFlow(body);
  // copy before the first list sits beside the photo; a heading that introduces the list moves with it
  let cut = flow.findIndex(isList);
  if (cut < 0) cut = flow.length;
  if (cut > 0 && cut < flow.length && flow[cut - 1].kind === 'h') cut -= 1;
  // with no opening copy at all, the first list sits beside the photo instead of a lone heading
  if (!flow.slice(0, cut).some((it) => it.kind === 'p')) cut = Math.min(flow.length, flow.findIndex(isList) + 1 || flow.length);
  const beside = flow.slice(0, cut);
  let below = flow.slice(cut);
  // closing paragraphs after the lists read across two columns instead of a narrow left strip
  let closing = [];
  const lastList = below.map(isList).lastIndexOf(true);
  if (lastList >= 0) {
    const tail = below.slice(lastList + 1);
    const paras = tail.filter((it) => it.kind === 'p');
    if (paras.length >= 3 && tail.every((it) => it.kind === 'p' || it.kind === 'cta')) { closing = tail; below = below.slice(0, lastList + 1); }
  }
  const main = images.find((im) => mediaWidth(im.file) >= 900) || images[0];

  const Head = title && (
    <header className={s.head}>
      <SplitText as="h2" className={s.title} text={title.text} />
      {subtitle && <p className={s.subtitle}><Text text={subtitle.text} links={subtitle.links} /></p>}
    </header>
  );

  return (
    <section className={s.feature}>
      <div className={`container ${main ? s.row : s.rowText} ${flip ? s.flip : ''}`}>
        {main && (
          <div className={s.mediaCol}>
            <figure className={`media ${s.media}`} style={{ '--ar': frameRatio(main.file, 3 / 4, 16 / 9), '--ar-m': frameRatio(main.file, 1, 16 / 9, 4 / 3) }} data-anim="fade">
              <Img file={main.file} alt={main.alt} sizes="(min-width: 900px) min(44vw, 620px), 92vw" />
            </figure>
          </div>
        )}
        {main ? (
          <div className={s.textCol}>
            {Head}
            {beside.length > 0 && <div className={`flow ${s.body}`} data-anim="fade-up"><Flow items={beside} route={route} /></div>}
          </div>
        ) : (
          <>
            <div className={s.textCol}>{Head}</div>
            {beside.length > 0 && <div className={`flow ${s.body}`} data-anim="fade-up"><Flow items={beside} route={route} /></div>}
          </>
        )}
      </div>
      {below.length > 0 && (
        <div className={`container ${s.below}`} data-anim="fade-up">
          <div className={`flow ${s.belowFlow}`}><Flow items={below} route={route} splitLong={false} /></div>
          {closing.length > 0 && <div className={`flow ${s.closing}`}><Flow items={closing} route={route} /></div>}
        </div>
      )}
    </section>
  );
}

/** The second photos of each topic, gathered into one even band instead of floating collages. */
function PhotoBand({ images }) {
  if (images.length < 3) return null;
  const shown = images.slice(0, images.length >= 6 ? 6 : 3);
  return (
    <section className={s.band} aria-label="Retreat photography">
      <div className={`container ${s.bandGrid}`} data-anim-stagger>
        {shown.map((im) => (
          <figure key={im.file} className={`media ${s.bandItem}`}>
            <Img file={im.file} alt={im.alt} sizes="(min-width: 900px) min(31vw, 440px), 46vw" />
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Luxury accommodation pages (Bali, Mexico): hero, aligned topic rows, one photo band, then the shared closing sections. */
export default function Destination({ page }) {
  const sections = buildSections(page);
  const [hero, ...rest] = sections[0]?.type === 'hero' ? sections : [null, ...sections];
  const img = heroImage(page, hero);

  const out = [];
  const spare = [];
  let n = 0;
  let bandPlaced = false;
  rest.forEach((sec, i) => {
    if (sec.type === 'editorial') {
      const images = contentImages(sec.blocks);
      const main = images.find((im) => mediaWidth(im.file) >= 900) || images[0];
      images.filter((im) => im !== main && mediaWidth(im.file) >= MIN_CARD_WIDTH).forEach((im) => spare.push(im));
      out.push(<Feature key={`${sec.id}-${i}`} section={sec} route={page.route} flip={n++ % 2 === 1} />);
      return;
    }
    // the photo band closes the run of accommodation topics, before the program and contact sections
    if (n > 0 && !bandPlaced && sec.type !== 'usp') { out.push(<PhotoBand key="band" images={spare} />); bandPlaced = true; }
    out.push(<RenderSections key={`${sec.id}-${i}`} sections={[sec]} route={page.route} startIndex={n} />);
  });
  if (!bandPlaced) out.push(<PhotoBand key="band" images={spare} />);

  return (
    <>
      {hero && <Hero blocks={hero.blocks} image={img} route={page.route} />}
      <div className={s.page}>{out}</div>
    </>
  );
}
