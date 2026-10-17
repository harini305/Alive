import Link from 'next/link';
import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import LeadForm from '@/components/LeadForm';
import YouTube from '@/components/YouTube';
import Carousel from '@/components/Carousel';
import { ASSETS, CONTACT, YOUTUBE, BOOKING_SERVICES } from '@/lib/site';
import { media, frameRatio } from '@/lib/media';
import BgVideo from './BgVideo';
import { contentImages, uspItems } from '@/lib/sections';
import { assignImages } from '@/lib/imagePick';
import { Flow, toFlow, splitHead, Text, Para, CtaLink, SmartLink } from './Rich';
import { WhatsAppIcon, Arrow } from '@/components/Icons';
import s from './Blocks.module.css';

/* ---------------- USP strip ---------------- */
export function Usp({ section }) {
  const items = uspItems(section.blocks);
  // the sunburst artwork is used as a mask so it can be drawn in the olive ink (the PNG is very faint)
  const sun = media(ASSETS.sunburst);
  return (
    <section className={`section-sm surface-ivory ${s.usp}`} aria-label="Why Alive">
      <div className="container">
        <ul className={s.uspList} data-anim-stagger="0.1">
          {items.map((it, i) => (
            <li key={i} className={s.uspItem}>
              <span className={s.sun} aria-hidden="true" style={sun ? { WebkitMaskImage: `url(${sun.smallest})`, maskImage: `url(${sun.smallest})` } : undefined} />
              <span className={s.uspLabel}>{it.label}</span>
              <span className={s.uspSub}>{it.sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Reflective statement ---------------- */
export function Statement({ section, route }) {
  const image = contentImages(section.blocks)[0];
  const lines = section.blocks.filter((b) => b.t === 'p');
  const links = section.blocks.filter((b) => b.t === 'link');
  const h = section.blocks.find((b) => b.t === 'h');
  return (
    <section className={`${s.statement} ${image ? s.statementImg : 'surface-ink'} on-dark`} style={image ? { '--ar-m': frameRatio(image.file, 1, 16 / 9, 4 / 3) } : undefined}>
      {image && (
        <div className={s.statementMedia} data-parallax="16" aria-hidden="true">
          <Img file={image.file} alt="" sizes="100vw" />
        </div>
      )}
      <div className={`container ${s.statementInner}`}>
        {h && <p className="kicker">{h.text}</p>}
        <div className={s.statementLines}>
          {lines.map((l, i) => (
            i === 0 && lines.length > 1
              ? <SplitText key={i} as="p" className={s.statementLead} text={l.text} />
              : <Para key={i} data-anim="fade-up" className={i === lines.length - 1 && lines.length > 2 ? s.statementLast : undefined} text={l.text} links={l.links} />
          ))}
        </div>
        {links.length > 0 && <div className={s.statementCtas} data-anim="fade-up">{links.map((l, i) => <CtaLink key={i} link={l} route={route} className={i ? 'btn-light' : ''} />)}</div>}
      </div>
    </section>
  );
}

/* ---------------- Lone CTA strip ---------------- */
export function Cta({ section, route }) {
  const links = section.blocks.filter((b) => b.t === 'link');
  return (
    <div className={`surface-sand ${s.ctaStrip}`}>
      <div className="container" data-anim="fade-up">{links.map((l, i) => <CtaLink key={i} link={l} route={route} className="btn-dark" />)}</div>
    </div>
  );
}

/* ---------------- Video ---------------- */
export function Video({ route }) {
  const yt = YOUTUBE[route];
  if (!yt) return null;
  return (
    <section className={`section-sm surface-ink ${s.video}`}>
      <div className="container">
        <h2 className={s.videoTitle} data-anim="fade-up">{yt.title}</h2>
        <div data-anim="clip"><YouTube id={yt.id} title={yt.title} /></div>
      </div>
    </section>
  );
}

/* ---------------- Program focus (Renew / Revitalise / Restore Me) ---------------- */
export function Focus({ section, route }) {
  const b = section.blocks;
  const firstCard = b.findIndex((x) => x.t === 'h' && x.level === 6);
  // intro = everything before the first card, excluding images that belong to the first card
  let introEnd = firstCard;
  while (introEnd > 0 && b[introEnd - 1].t === 'img') introEnd--;
  const intro = b.slice(0, introEnd);
  const { title, subtitle, body } = splitHead(intro);
  const cards = [];
  let cur = null;
  for (const x of b.slice(firstCard)) {
    if (x.t === 'h' && x.level === 6) { cur = { label: x.text, img: null, blocks: [] }; cards.push(cur); continue; }
    if (x.t === 'img') continue;
    if (cur && !cur.title && x.t === 'h' && x.level === 3) { cur.title = x; continue; }
    if (cur) cur.blocks.push(x);
  }
  // photos are matched to cards by their source alt text (then order); cards the capture has no
  // photo for get the closest original photograph from the site, so no card is left empty
  const picks = assignImages(cards.map((c) => ({ want: `${c.label} ${c.title?.text || ''}` })), b.filter((x) => x.t === 'img'));
  cards.forEach((c, i) => { c.img = picks[i]; });

  return (
    <section className={`section surface-ivory ${s.focus}`}>
      <div className="container">
        <header className={s.focusHead}>
          <div className={s.focusTitleWrap}>
            {title && <SplitText as="h2" className="h2" text={title.text.replace(/:$/, '')} />}
            {subtitle && <p className={s.focusSub} data-anim="fade-up"><Text text={subtitle.text} links={subtitle.links} /></p>}
          </div>
          <div className={`flow ${s.focusIntro}`} data-anim="fade-up"><Flow items={toFlow(body)} route={route} /></div>
        </header>
        <div className={s.focusGrid}>
          {cards.map((c, i) => {
            const flow = toFlow(c.blocks.filter((x) => x.t !== 'link'));
            const link = c.blocks.find((x) => x.t === 'link');
            return (
              <article key={i} className={s.focusCard} data-anim="fade-up">
                {c.img ? (
                  <div className={`media ${s.focusMedia}`} data-anim="clip">
                    <Img file={c.img.file} alt={c.img.alt} sizes="(min-width: 1100px) min(30vw, 440px), (min-width: 760px) 46vw, 92vw" />
                  </div>
                ) : null}
                <p className={`script ${s.focusScript}`}>{c.label}</p>
                {c.title && <h3 className={s.focusTitle}>{c.title.text}</h3>}
                <div className={`flow ${s.focusBody}`}><Flow items={flow} route={route} base={3} /></div>
                {link && <CtaLink link={link} route={route} variant="arrow" className={s.focusLink} />}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PDF / pricing lead band ---------------- */
export function LeadBand({ section, route }) {
  const image = contentImages(section.blocks)[0];
  const { title, body } = splitHead(section.blocks.filter((x) => x.t !== 'label' && x.t !== 'field'));
  const btn = section.blocks.find((x) => x.t === 'btn');
  // light surface (it is often followed by the dark 360 System panel): photo framed, form on paper
  return (
    <section id="packages" className="section surface-ivory">
      <div className={`container ${s.leadGrid}`}>
        <div className={s.leadText}>
          {title && <SplitText as="h2" className={s.leadTitle} text={title.text} />}
          <div className="flow" data-anim="fade-up"><Flow items={toFlow(body)} route={route} /></div>
          {image && (
            <figure className={`media ${s.leadMedia}`} data-anim="clip" style={{ '--ar': frameRatio(image.file, 4 / 3, 16 / 9, 16 / 10) }}>
              <Img file={image.file} alt="" sizes="(min-width: 960px) min(50vw, 700px), 92vw" />
            </figure>
          )}
        </div>
        <div className={s.leadCard} data-anim="fade-up">
          <LeadForm form="pdf" submitLabel={(btn?.text || 'Get PDF Packages & Pricing').replace(/\s*>+\s*$/, '')} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Confidential call back ---------------- */
export function Callback({ section, route }) {
  const { title, body } = splitHead(section.blocks);
  const flow = toFlow(body.filter((x) => x.t !== 'link'));
  return (
    <section id="callback" className={`section surface-sand ${s.callback}`}>
      <div className={`container ${s.callbackGrid}`}>
        <div>
          {title && <SplitText as="h2" className="h2" text={title.text} />}
          <div className={`flow ${s.callbackText}`} data-anim="fade-up"><Flow items={flow} route={route} /></div>
        </div>
        <div className={s.callbackForm} data-anim="fade-up">
          <LeadForm form="callback" submitLabel="Request Call" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- 360 system (video + diagram + 12-point list) ---------------- */
export function System({ section, route }) {
  const { title, body } = splitHead(section.blocks);
  const listText = (section.listBlocks || []).find((x) => x.t === 'p')?.text || '';
  // The 12 items were one run of text on the source; split on the known item boundaries.
  const items = listText.split(/\s+(?=(?:World Class|Complete Whole|Advanced Health|Personalised Detox|Immediate Physical|Proven 360|Empowering One|Deep Emotional|Integrated Mind|Identity, Habits|Full Life Transformation)\b)/);
  const poster = media(ASSETS.videoPoster);
  return (
    <section className={`${s.system} surface-ink`}>
      <BgVideo src={ASSETS.video360} poster={poster?.src} preload="none" wrapClassName={s.systemVideo} btnClassName={s.systemToggle} />
      <div className={`container section ${s.systemGrid}`}>
        <div className={s.systemText}>
          {title && <SplitText as="h2" className={s.systemTitle} text={title.text} />}
          <div className={`flow ${s.systemIntro}`} data-anim="fade-up"><Flow items={toFlow(body)} route={route} dark /></div>
          <div className={s.diagram} data-anim="fade">
            <Img file={ASSETS.diagram} alt="Alive's holistic approach: Advanced Physical Rejuvenation, Mental & Emotional Healing, Purpose & Life Direction and Full Life Integration combine to Transform The Whole Person" sizes="(min-width: 960px) 540px, 86vw" />
          </div>
        </div>
        <ol className={s.systemList} data-scrub-list>
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Levels of luxury (2 tiers) ---------------- */
export function Levels({ section, route }) {
  const intro = section.introBlocks ? splitHead(section.introBlocks) : null;
  const introImg = section.introBlocks ? contentImages(section.introBlocks)[0] : null;
  const { title, body } = splitHead(section.blocks);
  const images = contentImages(section.blocks);
  // tiers: the short name paragraphs ("Luxury Villa", "Expansive Residence")
  const ps = body.filter((x) => x.t === 'p');
  const nameIdx = ps.map((p, i) => (p.text.length < 40 ? i : -1)).filter((i) => i >= 0);
  const introParas = ps.slice(0, nameIdx[0] ?? ps.length);
  const tiers = nameIdx.map((ni, k) => ({ name: ps[ni].text, text: ps.slice(ni + 1, nameIdx[k + 1] ?? ps.length).map((p) => p.text), img: images[k] }));
  const link = section.blocks.find((x) => x.t === 'link');

  return (
    <section className={`section surface-paper ${s.levels}`}>
      {intro && (
        <div className={`container ${s.levelsIntro}`}>
          <div>
            {intro.title && <SplitText as="h2" className={`h2 ${s.levelsIntroTitle}`} text={intro.title.text} />}
            <div className="flow" data-anim="fade-up"><Flow items={toFlow(intro.body)} route={route} /></div>
          </div>
          {introImg && (
            <figure className={`media ${s.levelsIntroMedia}`} data-anim="clip" data-clip-from="right">
              <Img file={introImg.file} alt={introImg.alt} sizes="(min-width: 900px) min(56vw, 780px), 100vw" />
            </figure>
          )}
        </div>
      )}
      <div className="container">
        <div className={s.levelsTop}>
          <header className={s.levelsHead}>
            {title && <SplitText as={intro ? 'h3' : 'h2'} className={intro ? 'h3' : 'h2'} text={title.text} />}
            <div className="flow" data-anim="fade-up">{introParas.map((p, i) => <Para key={i} text={p.text} links={p.links} />)}</div>
            {link && <div className={s.levelsCta} data-anim="fade-up"><CtaLink link={link} route={route} className="btn-dark" /></div>}
          </header>
        </div>
        <div className={s.tiers}>
          {tiers.map((t, i) => (
            <article key={i} className={s.tier} data-anim="fade-up">
              {t.img && (
                <div className={`media ${s.tierMedia}`} data-anim="clip">
                  <Img file={t.img.file} alt={t.img.alt} sizes="(min-width: 900px) min(46vw, 650px), 100vw" />
                </div>
              )}
              <div className={s.tierBody}>
                <h3 className={s.tierName}>{t.name}</h3>
                {t.text.map((p, j) => <Para key={j} text={p} />)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Gallery ---------------- */
export function Gallery({ section }) {
  const images = contentImages(section.blocks);
  const { title, subtitle } = splitHead(section.blocks);
  return (
    <section className={`section surface-ink ${s.gallery}`}>
      <div className="container">
        <header className={s.galleryHead}>
          {title && <SplitText as="h2" className="h2" text={title.text} />}
          {subtitle && <p className={s.gallerySub}>{subtitle.text}</p>}
        </header>
      </div>
      <Carousel label={title?.text || 'Gallery'}>
        {images.map((im) => (
          <figure key={im.file} className={`media ${s.galleryItem}`}>
            <Img file={im.file} alt={im.alt} sizes="(min-width: 900px) 34vw, 82vw" />
          </figure>
        ))}
      </Carousel>
    </section>
  );
}

/* ---------------- Booking service card ---------------- */
export function BookingCard({ slug = 'speak-with-your-client-manager', compact = false, inline = false }) {
  const svc = BOOKING_SERVICES.find((x) => x.slug === slug);
  const href = svc.calendar || `/service-page/${svc.slug}`;
  // slim one-line variant that sits in a row of actions
  if (inline) {
    return (
      <div className={s.bookingInline}>
        <Img file={ASSETS.skye} alt="" sizes="44px" className={s.bookingInlinePortrait} />
        <span className={s.bookingInlineText}><Link href={`/service-page/${svc.slug}`}>{svc.name}</Link><span>{svc.duration}</span></span>
        <Link href={href} className="btn btn-dark btn-sm">Book Now<Arrow /></Link>
      </div>
    );
  }
  return (
    <div className={`${s.bookingWrap} ${compact ? s.bookingCompact : ''}`} data-anim="fade-up"><div className={s.booking}>
      <Img file={ASSETS.skye} alt="Skye, client manager" sizes="96px" className={s.bookingPortrait} />
      <div className={s.bookingBody}>
        <h3 className={s.bookingName}><Link href={`/service-page/${svc.slug}`}>{svc.name}</Link></h3>
        {svc.tagline && <p className={s.bookingTag}>{svc.tagline}</p>}
        <p className={s.bookingMeta}>{svc.duration}</p>
      </div>
      <Link href={href} className={`btn btn-dark btn-sm ${s.bookingBtn}`}>Book Now<Arrow /></Link>
    </div></div>
  );
}

export function BookingSection({ section, route }) {
  return (
    <section className="section-sm surface-ivory">
      <div className="container container-narrow"><BookingCard /></div>
    </section>
  );
}

/* ---------------- Looking for personalised support ---------------- */
export function Support({ section, route }) {
  const { title, body } = splitHead(section.blocks.filter((x) => !(x.t === 'li' && /^speak with your client manager/i.test(x.text))));
  return (
    <section className={`surface-ivory ${s.support}`}>
      {/* compact: portrait sized to the copy, copy in two columns, every action on one line, so this
          closing section and the footer fit one screen together */}
      <div className={`container ${s.supportGrid}`}>
        <figure className={s.supportPortrait} data-anim="fade">
          <Img file={ASSETS.skye} alt="Skye, Alive client manager" sizes="(min-width: 900px) 260px, 96px" />
        </figure>
        <div className={s.supportText}>
          {title && <SplitText as="h2" className={s.supportTitle} text={title.text} />}
          <div className={`flow ${s.supportCopy}`} data-anim="fade-up"><Flow items={toFlow(body)} route={route} /></div>
          <div className={s.supportActions} data-anim="fade-up">
            <a className="btn btn-dark btn-sm" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> WhatsApp {CONTACT.whatsappDisplay}</a>
            <BookingCard inline />
            <Link href="/book-call" className="link-arrow">Speak To A Retreat Advisor<Arrow className="" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
