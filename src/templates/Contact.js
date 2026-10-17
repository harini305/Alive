import Link from 'next/link';
import PageHeadMedia from '@/components/PageHeadMedia';
import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import LeadForm from '@/components/LeadForm';
import Hero from '@/sections/Hero';
import { BookingCard } from '@/sections/Blocks';
import { Flow, toFlow, Text } from '@/sections/Rich';
import { contentImages } from '@/lib/sections';
import { CONTACT, PDFS, ASSETS } from '@/lib/site';
import { Arrow, WhatsAppIcon, MailIcon, PhoneIcon, DownloadIcon } from '@/components/Icons';
import s from './Contact.module.css';

const blocksOf = (page) => page.sections.flatMap((x) => x.blocks);
const findP = (page, re) => blocksOf(page).find((b) => b.t === 'p' && re.test(b.text))?.text;

/* ---------------- /contact ---------------- */
export function Contact({ page }) {
  const have = findP(page, /^If you would like to speak/);
  const channels = [
    { k: 'WhatsApp', v: CONTACT.whatsappDisplay, cta: 'Message on WhatsApp', href: CONTACT.whatsappUrl, icon: <WhatsAppIcon size={22} />, ext: true },
    { k: 'Email', v: CONTACT.email, cta: 'Email bookings', href: `mailto:${CONTACT.email}`, icon: <MailIcon size={22} /> },
    { k: 'Call', v: CONTACT.callDisplay, cta: 'Call us', href: CONTACT.callTel, icon: <PhoneIcon size={22} /> },
    { k: 'Get A Quote', v: 'Get A Custom Package', cta: 'Get a custom quote', href: '/get-a-quote', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h5" /></svg> },
  ];
  return (
    <>
      <section className={s.hero}>
        <div className="container page-head"><div className="page-head-text">
          <SplitText as="h1" mode="hero" className={s.title} text="Contact Alive" />
        </div>
          <PageHeadMedia route={page.route} />
        </div>
      </section>
      <section className="section-sm surface-ivory">
        <div className="container">
          <ul className={s.channels} data-anim-stagger="0.1">
            {channels.map((c) => (
              <li key={c.k} className={s.channel}>
                <span className={s.channelIcon}>{c.icon}</span>
                <p className={s.channelV}>{c.v}</p>
                {c.href.startsWith('/') ? (
                  <Link href={c.href} className="link-arrow">{c.cta}<Arrow className="" /></Link>
                ) : (
                  <a href={c.href} className="link-arrow" {...(c.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.cta}<Arrow className="" /></a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section surface-paper">
        <div className={`container ${s.split}`}>
          <div>
            <SplitText as="h2" className="h2" text="Have Questions?" />
            {have && <p className={s.lead} data-anim="fade-up">{have}</p>}
          </div>
          <BookingCard />
        </div>
      </section>
    </>
  );
}

/* ---------------- /get-a-quote ---------------- */
export function GetAQuote({ page }) {
  const intro = blocksOf(page).filter((b) => b.t === 'p').map((b) => b.text);
  return (
    <>
      <section className={s.hero}>
        <div className="container page-head"><div className="page-head-text">
          <SplitText as="h1" mode="hero" className={s.title} text="3 Easy Ways To Book" />
        </div>
          <PageHeadMedia route={page.route} />
        </div>
      </section>
      <section className="section-sm surface-ivory">
        <div className={`container ${s.ways}`}>
          <article className={s.way} data-anim="fade-up">
            <h2 className={s.wayTitle}>Phone or WhatsApp</h2>
            <p>{intro[0]}</p>
            <p>{intro[1]}</p>
            <div className={s.wayActions}>
              <a className="btn btn-sm btn-dark" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> WhatsApp (Bali) <span className="tnum">{CONTACT.whatsappDisplay}</span></a>
              <a className="link-arrow" href={CONTACT.usTel}>Call (USA) <span className="tnum">{CONTACT.usDisplay}</span><Arrow className="" /></a>
            </div>
          </article>
          <article className={s.way} data-anim="fade-up">
            <h2 className={s.wayTitle}>Chat</h2>
            <p>{intro[2]}</p>
            <div className={s.wayActions}>
              <a className="btn btn-sm btn-outline" href={CONTACT.chatbotUrl} target="_blank" rel="noopener noreferrer">Ask questions via chat<Arrow /></a>
              <Link className="link-arrow" href="/instant-pricing-packages-chat">Chat with Skye<Arrow className="" /></Link>
            </div>
          </article>
          <article className={`${s.way} ${s.wayForm}`} data-anim="fade-up">
            <h2 className={s.wayTitle}>Request A Booking</h2>
            <LeadForm form="quote" submitLabel="Get My Custom Quote" />
          </article>
        </div>
      </section>
      <section className="section surface-sand">
        <div className={`container ${s.split}`}>
          <SplitText as="h2" className="h2" text="Not sure? Speak to an Alive Wellness Concierge Today To Book Your retreat…" />
          <BookingCard />
        </div>
      </section>
    </>
  );
}

/* ---------------- /book-call ---------------- */
export function BookCall({ page }) {
  const blocks = blocksOf(page);
  const h1 = blocks.find((b) => b.t === 'h' && b.level === 1)?.text || '';
  const [h1a, h1b] = h1.split(/(?<=Coach)\s+/);
  const introEnd = blocks.findIndex((b) => b.t === 'li');
  const intro = blocks.slice(blocks.findIndex((b) => b.t === 'h' && b.level === 1) + 1, introEnd).filter((b) => b.t === 'p');
  const mainStart = blocks.findIndex((b) => b.t === 'h' && /gentle, supportive conversation/i.test(b.text));
  const notSure = blocks.findIndex((b) => b.t === 'h' && /^Not sure\?/.test(b.text));
  const main = blocks.slice(mainStart, notSure > 0 ? notSure : undefined).filter((b) => !(b.t === 'h' && b.level === 2 && /Speak With Your Client Manager/.test(b.text)) && b.t !== 'img');
  return (
    <>
      <section className={s.splitHero}>
        <div className={`container ${s.splitHeroGrid}`}>
          <div className={s.splitHeroText}>
            <SplitText as="h1" mode="hero" className={s.title} text={h1a} />
            {h1b && <p className={s.subTitle} data-hero-in>{h1b}</p>}
            <div className="flow" data-hero-in>{intro.map((p, i) => <p key={i}>{p.text.replace(/^\*+\s*/, '')}</p>)}</div>
            <h2 className="sr-only">Book your call</h2>
            <div data-hero-in><BookingCard /></div>
          </div>
          <figure className={s.portrait} data-anim="clip">
            <Img file={ASSETS.skye} alt="Skye, Alive coach and client manager" priority sizes="(min-width: 900px) 38vw, 90vw" />
          </figure>
        </div>
      </section>
      <section className="section surface-paper">
        <div className={`container ${s.letter}`}>
          <div className={`flow ${s.letterBody}`} data-anim="fade-up">
            <Flow items={toFlow(main)} route={page.route} />
          </div>
        </div>
      </section>
      <section className="section-sm surface-ink">
        <div className="container center">
          <p className={s.waLine} data-anim="fade-up">Not sure? Simply whatsapp your Alive Coach here directly:</p>
          <a className="btn" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} /> WHATSAPP: {CONTACT.whatsappDisplay}</a>
        </div>
      </section>
    </>
  );
}

/* ---------------- /instant-pricing-packages-chat ---------------- */
export function ChatPage({ page }) {
  const blocks = blocksOf(page);
  const img = contentImages(blocks)[0];
  const ps = blocks.filter((b) => b.t === 'p').map((b) => b.text);
  const get = (re) => ps.find((p) => re.test(p));
  return (
    <section className={s.chatHero}>
      <div className={`container ${s.chatGrid}`}>
        <figure className={s.chatPortrait} data-anim="clip">
          <Img file={img?.file || ASSETS.skye} alt="Skye, Alive Coach" priority sizes="(min-width: 900px) 34vw, 80vw" />
        </figure>
        <div className={s.chatText}>
          <SplitText as="h1" mode="hero" className={s.title} text="Hi, I’m Skye" />
          <p className="lead" data-hero-in>{get(/^Speak with your personal/)}</p>
          <div className={`flow ${s.chatBody}`} data-hero-in>
            {[get(/^I’m an Alive Coach/), get(/^At Alive/), get(/^Whatsapp me here/)].filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <a className="btn" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" data-hero-in><WhatsAppIcon size={18} /> Chat via Whatsapp here</a>
          <div className={s.chatMore} data-anim="fade-up">
            <h2 className={s.chatMoreTitle}>Prefer to get your own info fast?</h2>
            <div className={s.chatLinks}>
              <Link href="/download" className={s.chatLink}><DownloadIcon size={20} /><span><strong>Download PDF Packages Here</strong>Get all the info to your inbox.</span></Link>
              <a href={CONTACT.chatbotUrl} target="_blank" rel="noopener noreferrer" className={s.chatLink}><Arrow className="" /><span><strong>Ask questions via our chatbot below</strong>Opens the Alive chatbot (external site)</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- /download ---------------- */
export function Download({ page }) {
  const ps = blocksOf(page).filter((b) => b.t === 'p').map((b) => b.text);
  const welcome = ps.filter((p) => p.length > 40);
  return (
    <section className={s.dlHero}>
      <div className={`container ${s.dlGrid}`}>
        <div className={s.dlText}>
          <a className={s.need} href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" data-hero-in><WhatsAppIcon size={16} /> Need help? Whatsapp Here</a>
          <SplitText as="h1" mode="hero" className={s.title} text="Get Retreat packages & Pricing" />
          <div className="flow" data-hero-in>{welcome.map((p, i) => <p key={i} className={i === 0 ? 'lead' : ''}>{p}</p>)}</div>
          <div className={s.sign} data-hero-in>
            <Img file={ASSETS.skye} alt="" sizes="64px" className={s.signImg} />
            <p><span className={s.signName}>Skye</span><br />Client Manager</p>
          </div>
        </div>
        <div className={s.dlCard} data-hero-in id="packages">
          <LeadForm form="pdf" submitLabel="Get PDF Packages & Pricing" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- /pdf ---------------- */
export function PdfPage({ page }) {
  const files = [
    { ...PDFS.vip, title: 'VIP Private Retreat', desc: 'A transformational program for robust health, mental wellbeing & recreating your life' },
    { ...PDFS.packages, title: 'Wellness Retreat Packages', desc: 'Alive in Bali and Mexico: accommodation, daily wellness, dining, therapies, inclusions and retreat pricing' },
    { ...PDFS.packagesAlt, title: 'Wellness Retreat Packages', desc: 'Alternate edition of the packages document' },
  ];
  return (
    <>
      <section className={s.hero}>
        <div className="container page-head"><div className="page-head-text">
          <SplitText as="h1" mode="hero" className={s.title} text="Download Our VIP Private Retreat Package" />
          <p className={s.lead} data-hero-in>If you requested a call back, we look forward to talking soon.</p>
          <p data-hero-in>First things first, open the PDF to see packages below.</p>
        </div>
          <PageHeadMedia route={page.route} />
        </div>
      </section>
      <section className="section-sm surface-ivory">
        <div className="container">
          <ul className={s.pdfList} data-anim-stagger="0.1">
            {files.map((f) => (
              <li key={f.href}>
                <a href={f.href} target="_blank" rel="noopener" className={s.pdfItem}>
                  <span className={s.pdfIcon}><DownloadIcon size={22} /></span>
                  <span className={s.pdfText}><strong>{f.title}</strong><span>{f.desc}</span></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section surface-paper">
        <div className={`container ${s.split}`}>
          <div>
            <SplitText as="h2" className="h2" text="We get it… Finding a retreat that is right for you can be overwhelming." />
            <p className={s.lead} data-anim="fade-up">Get a custom retreat package that is built just for you! Or call us below…</p>
            <div className={s.wayActions} data-anim="fade-up">
              <a className="btn btn-dark" href={CONTACT.usTel}><PhoneIcon size={16} /> {CONTACT.usDisplay}</a>
              <a className="btn btn-outline" href={CONTACT.chatbotUrl} target="_blank" rel="noopener noreferrer">Ask questions via chat<Arrow /></a>
            </div>
          </div>
          <div className="flow" data-anim="fade-up">
            <p>Connect with an Alive Wellness Advisor and your booking concierge by phone or whatsapp.</p>
            <p>They will help you get booked in today.</p>
            <p>Book a confidential call with your wellness advisor to customise a program to suit you needs.</p>
            <p>Select a time that suits you here.</p>
            <BookingCard />
          </div>
        </div>
      </section>
    </>
  );
}
