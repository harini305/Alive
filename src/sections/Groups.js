import Link from 'next/link';
import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import Carousel from '@/components/Carousel';
import QuoteSlider from '@/components/QuoteSlider';
import { ASSETS, TESTIMONIAL_IMAGES, SHARED_IMAGES } from '@/lib/site';
import { getPosts } from '@/lib/content';
import home from '@/content/generated/pages/home.json';
import { assignImages, MIN_CARD_WIDTH } from '@/lib/imagePick';
import { hasMedia, mediaWidth } from '@/lib/media';
import { smartText } from '@/lib/sections';
import { Flow, toFlow, splitHead, Text, Para, CtaLink } from './Rich';
import { Arrow } from '@/components/Icons';
import s from './Groups.module.css';

/**
 * Builds cards from a block stream where `isTitle` marks a card title. On the source, each card's
 * photo sits just before its title in the DOM, so pending images are handed to the next title.
 */
function collectCards(blocks, isTitle) {
  const cards = [];
  const before = [];
  let pending = [];
  let cur = null;
  for (const b of blocks) {
    if (b.t === 'img') {
      if (SHARED_IMAGES.has(b.file)) continue;
      pending.push(b);
      continue;
    }
    if (isTitle(b)) {
      cur = { title: b, img: pending.shift() || null, blocks: [] };
      cards.push(cur);
      continue;
    }
    if (cur) cur.blocks.push(b); else before.push(b);
  }
  return { before, cards, leftover: pending };
}

/* ---------------- 4 × 4 transformation pillars ---------------- */
function pillarGroups(section) {
  // split by H2 into groups
  const groups = [];
  let g = null;
  let pre = [];
  for (const b of section.blocks) {
    if (b.t === 'h' && b.level === 2) { g = { title: b.text, blocks: [...pre] }; pre = []; groups.push(g); continue; }
    if (!g) { pre.push(b); continue; }
    g.blocks.push(b);
  }
  // carry trailing images of a group into the next one (they precede its first card)
  for (let i = 0; i < groups.length; i++) {
    const bl = groups[i].blocks;
    while (bl.length && bl[bl.length - 1].t === 'img' && groups[i + 1]) groups[i + 1].blocks.unshift(bl.pop());
  }
  return groups.map((grp) => ({ title: grp.title, cards: collectCards(grp.blocks, (b) => b.t === 'h' && b.level === 3).cards }));
}

// The home page carries the complete set of 16 pillar photos. Some page captures miss one, which
// left a card without a photo and shifted every later photo onto the wrong card; each card title
// therefore takes the home page's photo for that pillar.
const PILLAR_PHOTOS = (() => {
  const map = new Map();
  const section = home.sections.find((sec) => sec.blocks.some((b) => b.t === 'h' && b.level === 2 && b.text === 'Integrate The New You'));
  if (section) for (const grp of pillarGroups(section)) for (const c of grp.cards) if (c.img) map.set(c.title.text, c.img);
  return map;
})();

export function Pillars({ section, route }) {
  const groups = pillarGroups(section);
  for (const grp of groups) for (const c of grp.cards) c.img = PILLAR_PHOTOS.get(c.title.text) || c.img;
  return (
    <section className={`section surface-ivory ${s.pillars}`}>
      <div className="container">
        {groups.map((grp, gi) => {
          const { cards } = grp;
          return (
            <div key={gi} className={s.chapter}>
              <div className={s.chapterHead}>
                <SplitText as="h2" className={s.chapterTitle} text={grp.title} />
                <span className={s.chapterRule} data-line aria-hidden="true" />
              </div>
              {/* 4 across on desktop, 2 on tablet, a swipeable row on phones */}
              <div className={s.pillarGrid} role="group" aria-label={smartText(grp.title)} tabIndex={0}>
                {cards.map((c, ci) => (
                  <article key={ci} className={s.pillarCard} data-anim="fade-up">
                    {c.img && (
                      <div className={`media ${s.pillarMedia}`}>
                        <Img file={c.img.file} alt={c.img.alt} sizes="(min-width: 1100px) min(24vw, 330px), (min-width: 700px) 46vw, 80vw" />
                      </div>
                    )}
                    <h3 className={s.pillarTitle}>{smartText(c.title.text)}</h3>
                    {c.blocks.filter((b) => b.text).map((b, bi) => <Para key={bi} className={s.pillarText} text={b.text} links={b.links} />)}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- generic card grid ---------------- */
export function Cards({ section, route, index = 0 }) {
  const level = section.blocks.filter((b) => b.t === 'h' && b.level === 3).length >= 3 ? 3 : 4;
  // headline/intro: leading blocks before the first card title
  const { before, cards, leftover: spare } = collectCards(section.blocks, (b) => b.t === 'h' && b.level === level && b.text.length < 120);
  // photos too small for the card frame are swapped for a better original where possible
  cards.forEach((c) => { if (c.img && hasMedia(c.img.file) && mediaWidth(c.img.file) < MIN_CARD_WIDTH) c.img = null; });
  // fill photo gaps when most cards have one (match by alt text, then the site's photography)
  let leftover = spare.filter((im) => !hasMedia(im.file) || mediaWidth(im.file) >= MIN_CARD_WIDTH);
  const missing = cards.filter((c) => !c.img);
  if (missing.length && missing.length <= cards.length / 2) {
    const picks = assignImages(missing.map((c) => ({ want: c.title.text })), leftover, new Set(cards.filter((c) => c.img).map((c) => c.img.file)));
    missing.forEach((c, i) => { c.img = picks[i]; });
    leftover = [];
  }
  const { title, subtitle, body } = splitHead(before);
  const intro = toFlow(body);
  const trailingLinks = [];
  cards.forEach((c) => { c.links = c.blocks.filter((b) => b.t === 'link'); });
  const dense = cards.length >= 8;
  const surf = index % 2 ? 'surface-sand' : 'surface-paper';
  return (
    <section className={`section ${surf}`} id={/team/i.test(title?.text || '') ? 'team' : undefined}>
      <div className="container">
        {(title || intro.length > 0) && (
          <header className={s.cardsHead}>
            {title && <SplitText as="h2" className="h2" text={title.text} />}
            {subtitle && <p className={s.cardsSub} data-anim="fade-up"><Text text={subtitle.text} links={subtitle.links} /></p>}
            {intro.length > 0 && <div className={`flow ${s.cardsIntro}`} data-anim="fade-up"><Flow items={intro} route={route} /></div>}
          </header>
        )}
        <div className={`${s.cardGrid} ${dense ? s.dense : ''}`}>
          {cards.map((c, i) => (
            <article key={i} className={s.card} data-anim="fade-up">
              {c.img && (
                <div className={`media ${s.cardMedia}`}>
                  <Img file={c.img.file} alt={c.img.alt} sizes={dense ? '(min-width: 1200px) min(23vw, 330px), (min-width: 1000px) 31vw, (min-width: 640px) 46vw, 92vw' : '(min-width: 1000px) min(31vw, 440px), (min-width: 640px) 46vw, 92vw'} />
                </div>
              )}
              <h3 className={s.cardTitle}>{smartText(c.title.text)}</h3>
              <div className={`flow ${s.cardBody}`}><Flow items={toFlow(c.blocks)} route={route} ctaVariant="arrow" base={3} /></div>
            </article>
          ))}
        </div>
        {leftover.length > 0 && (
          <div className={s.cardLeftover} data-anim-stagger>
            {leftover.map((im) => <figure key={im.file} className="media"><Img file={im.file} alt={im.alt} sizes="(min-width: 900px) 25vw, 50vw" /></figure>)}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Meet your team (role tiles) ---------------- */
export function Team({ section, route }) {
  const { before, cards } = collectCards(section.blocks, (b) => b.t === 'h' && b.level === 4);
  const { title } = splitHead(before);
  return (
    <section id="team" className={`section surface-ink ${s.team}`}>
      <div className="container">
        <header className={s.teamHead}>
          {title && <SplitText as="h2" className="h2" text={title.text} />}
        </header>
        <ul className={s.teamGrid} data-anim-stagger="0.05">
          {cards.map((c, i) => (
            <li key={i} className={s.teamItem}>
              {c.img && <div className={`media ${s.teamMedia}`}><Img file={c.img.file} alt={c.img.alt} sizes="(min-width: 1100px) 16vw, (min-width: 700px) 30vw, 45vw" /></div>}
              <span className={s.teamRole}>{smartText(c.title.text)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Client reviews ---------------- */
export function Reviews({ section, route }) {
  const { title, body } = splitHead(section.blocks);
  const ps = body.filter((b) => b.t === 'p');
  const intro = ps[0];
  const quotes = ps.slice(1).map((p) => p.text);
  const cards = section.blocks.filter((b) => b.t === 'img' && TESTIMONIAL_IMAGES[b.file]);
  const banner = section.blocks.some((b) => b.t === 'img' && b.file === ASSETS.reviewsBanner);
  return (
    <section className={`section surface-paper ${s.reviews}`}>
      <div className={`container ${s.reviewsGrid}`}>
        <div className={s.reviewsIntro}>
          {title && <SplitText as="h2" className="h2" text={title.text} />}
          {intro && <p data-anim="fade-up"><Text text={intro.text} links={intro.links} /></p>}
          {banner && (
            <p className={s.badge} data-anim="fade-up">
              <span className={s.badgeStars} aria-hidden="true">★★★★★</span>
              <span className="sr-only">Rated five stars: </span>
              <span className={s.badgeText}><strong className="tnum">1,000+</strong> five-star reviews</span>
            </p>
          )}
        </div>
        {quotes.length > 0 && <div data-anim="fade-up"><QuoteSlider quotes={quotes} /></div>}
      </div>
      {cards.length > 0 && (
        <div className={s.reviewCards}>
          <Carousel label="Client review cards" itemClass={s.reviewItem}>
            {cards.map((c) => (
              <figure key={c.file} className={s.reviewFig}>
                <Img file={c.file} alt={`Client review card: ${TESTIMONIAL_IMAGES[c.file]}`} sizes="(min-width: 640px) 520px, 82vw" />
                <figcaption>{TESTIMONIAL_IMAGES[c.file]}</figcaption>
              </figure>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
}

/* ---------------- Latest posts strip ---------------- */
export function BlogStrip({ section }) {
  const titles = section.blocks.filter((b) => b.t === 'h').map((b) => b.text);
  const all = getPosts();
  const posts = titles.map((t) => all.find((p) => p.title === t)).filter(Boolean);
  const list = posts.length ? posts : all.slice(0, 3);
  return (
    <section className={`section surface-ivory ${s.blog}`}>
      <div className="container">
        <header className={s.blogHead}>
          <div>
            <SplitText as="h2" className="h2" text="Alive News" />
          </div>
          <Link href="/blog" className="link-arrow">See All Posts<Arrow className="" /></Link>
        </header>
        <div className={s.newsGrid}>
          {list.slice(0, 3).map((p) => <PostCard key={p.route} post={p} excerpt />)}
        </div>
      </div>
    </section>
  );
}

export function PostCard({ post, large, row, excerpt }) {
  const date = post.datePublished ? new Date(post.datePublished).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  return (
    <article className={`${s.post} ${large ? s.postLarge : ''} ${row ? s.postRow : ''}`} data-anim="fade-up">
      <Link href={post.route} className={s.postLink}>
        <div className={`media ${s.postMedia}`}>
          {post.cover && <Img file={post.cover} alt="" sizes={large ? '(min-width: 1100px) min(52vw, 720px), 92vw' : row ? '(min-width: 1100px) 280px, (min-width: 760px) 46vw, 92vw' : '(min-width: 1100px) min(31vw, 440px), (min-width: 700px) 46vw, 92vw'} />}
        </div>
        <div className={s.postMeta}>{date}{post.author ? ` · ${post.author}` : ''}</div>
        <h3 className={s.postTitle}>{smartText(post.title)}</h3>
        {(large || excerpt) && post.excerpt && <p className={`${s.postExcerpt} ${excerpt ? s.postExcerptClamp : ''}`}>{post.excerpt}</p>}
        <span className="link-arrow">Read<Arrow className="" /></span>
      </Link>
    </article>
  );
}
