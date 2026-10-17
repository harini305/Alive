import Link from 'next/link';
import PageHeadMedia from '@/components/PageHeadMedia';
import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import BookingRequest from '@/components/BookingRequest';
import { BOOKING_SERVICES, ASSETS } from '@/lib/site';
import { contentImages } from '@/lib/sections';
import { Flow, toFlow } from '@/sections/Rich';
import { Arrow } from '@/components/Icons';
import s from './Booking.module.css';

const blocksOf = (page) => page.sections.flatMap((x) => x.blocks);

/* ---------------- /book-online — the four Wix Bookings services ---------------- */
export function BookOnline({ page }) {
  const imgs = contentImages(blocksOf(page)).concat(page.extraImages || []);
  // service images as used on each service's own page on the source
  const IMG = {
    'speak-with-your-client-manager': ASSETS.skye,
    interview: '45f076_d7a687e987d94323b2db55c7085b5017~mv2.jpg',
    'heidi-pre-retreat-program-manager-call': '45f076_3643dfcb6d584d53ae1620993aba9798~mv2.png',
    'pre-retreat-health-assessment': '253a4a_3a3b2fd7f2594b7aa3abf657386d9514~mv2.png',
  };
  return (
    <>
      <section className={s.hero}>
        <div className="container page-head"><div className="page-head-text">
          <SplitText as="h1" mode="hero" className={s.title} text="Book A Consult – Select Day & Time" />
        </div>
          <PageHeadMedia route={page.route} />
        </div>
      </section>
      <section className="section-sm surface-ivory">
        <div className="container">
          <ul className={s.services} data-anim-stagger="0.1">
            {BOOKING_SERVICES.map((svc) => {
              const file = imgs.find((i) => i.file === IMG[svc.slug])?.file || IMG[svc.slug];
              return (
                <li key={svc.slug} className={s.service}>
                  <div className={`media ${s.serviceMedia}`}><Img file={file} alt="" sizes="(min-width: 900px) 22vw, 90vw" /></div>
                  <div className={s.serviceBody}>
                    <h2 className={s.serviceName}><Link href={`/service-page/${svc.slug}`}>{svc.name}</Link></h2>
                    {svc.tagline && <p>{svc.tagline}</p>}
                    <p className={s.duration}>{svc.duration}</p>
                  </div>
                  <div className={s.serviceActions}>
                    <Link href={svc.calendar || `/service-page/${svc.slug}#schedule`} className="btn btn-sm btn-dark">Book<span className="sr-only"> {svc.name}</span><Arrow /></Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ---------------- /booking-calendar/* ---------------- */
export function BookingCalendar({ page }) {
  const svc = BOOKING_SERVICES[0]; // both live calendar URLs show "Speak With Your Client Manager"
  const ps = blocksOf(page).filter((b) => b.t === 'p').map((b) => b.text);
  return (
    <section className={s.calHero}>
      <div className="container">
        <div className="page-head">
          <div className="page-head-text">
            <SplitText as="h1" mode="hero" className={s.title} text={svc.name} />
            <div className={s.calIntro} data-hero-in>{ps.map((p, i) => <p key={i} className={i === 0 ? 'lead' : ''}>{p}</p>)}</div>
          </div>
          <PageHeadMedia route={page.route} />
        </div>
        <div data-hero-in id="schedule"><BookingRequest service={svc} /></div>
      </div>
    </section>
  );
}

/* ---------------- /service-page/* ---------------- */
export function ServicePage({ page }) {
  const slug = page.route.split('/').pop();
  const svc = BOOKING_SERVICES.find((x) => x.slug === slug) || BOOKING_SERVICES[0];
  const blocks = blocksOf(page);
  const descIdx = blocks.findIndex((b) => b.t === 'h' && b.level === 2);
  const details = descIdx >= 0 ? blocks.slice(descIdx) : [];
  const img = (page.extraImages || []).find((x) => x.file !== ASSETS.skye) || null;
  const location = blocks.find((b) => b.t === 'p' && b.text === 'Bali') ? 'Bali' : null;
  // contact details are listed as "Place +phone email" items; show each once
  const cleaned = [];
  const seen = new Set();
  for (const b of details) {
    if (b.t === 'li') {
      const m = b.text.match(/^(.*?)\s(\+\d{6,})\s(\S+@\S+)$/);
      if (m) { if (!seen.has(m[1])) { seen.add(m[1]); cleaned.push({ t: 'li', text: `${m[1]} · ${m[2]} · ${m[3]}` }); } continue; }
    }
    if (b.t === 'p' && (seen.has(b.text) || /^\+\d{6,}$/.test(b.text) || /^\S+@\S+$/.test(b.text))) continue;
    cleaned.push(b);
  }
  return (
    <>
      <section className={s.hero}>
        <div className={`container ${s.svcGrid}`}>
          <div>
            <p className={s.crumbs} data-hero-in><Link href="/book-online">Service list</Link> / {svc.name}</p>
            <SplitText as="h1" mode="hero" className={s.title} text={svc.name} />
            {svc.tagline && <p className="lead" data-hero-in>{svc.tagline}</p>}
            <p className={s.facts} data-hero-in><span>{svc.duration}</span>{location && <span>{location}</span>}</p>
            <a href="#schedule" className="btn btn-dark" data-hero-in>Book Now<Arrow /></a>
          </div>
          {img && <figure className={`media ${s.svcMedia}`} data-anim="clip"><Img file={img.file} alt="" priority sizes="(min-width: 900px) 40vw, 100vw" /></figure>}
        </div>
      </section>
      {cleaned.length > 0 && (
        <section className="section-sm surface-paper">
          <div className={`container container-narrow flow ${s.details}`} data-anim="fade-up"><Flow items={toFlow(cleaned)} route={page.route} /></div>
        </section>
      )}
      <section className="section-sm surface-sand" id="schedule">
        <div className="container"><BookingRequest service={svc} /></div>
      </section>
    </>
  );
}
