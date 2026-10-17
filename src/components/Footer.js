'use client';
import Link from 'next/link';
import { useState } from 'react';
import Img from './ClientImg';
import { CONTACT, SOCIAL, FOOTER_NAV, ASSETS } from '@/lib/site';
import { WhatsAppIcon, MailIcon } from './Icons';
import s from './Footer.module.css';

// Live pages that exist on the source site but sit outside its main menu (audit 02 / 07 §B).
const MORE = [
  { label: 'Executive Burnout Retreat', href: '/private-luxury-vip-burnout-retreats' },
  { label: 'One On One Retreats', href: '/vip-one-on-one-private-retreats' },
  { label: 'Emotional Wellbeing Retreat', href: '/wellness-and-emotional-wellbeing-retreat' },
  { label: 'Weight Loss Retreats', href: '/weight-loss-retreat' },
  { label: 'Relationship Retreats', href: '/relationship-help-retreats' },
  { label: 'Spain, Europe', href: '/spain-europe' },
  { label: 'Wellness Retreats Australia', href: '/wellness-retreat-australia' },
  { label: 'Mental Health Australia', href: '/mental-health-retreat-australia' },
  { label: 'Mental Health USA', href: '/usa-mental-health-retreat' },
  { label: 'UAE Residents', href: '/uae' },
];

// Small screens: link lists fold behind their titles so the footer fits one screen; always open on desktop.
function LinkGroup({ id, title, label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className={`${s.col} ${s.group}`} aria-label={label} data-open={open}>
      <p className={`${s.colTitle} ${s.groupTitle}`}>{title}</p>
      <button type="button" className={s.groupToggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {title}<span className={s.groupIcon} aria-hidden="true" />
      </button>
      <div id={id} className={s.groupBody}>{children}</div>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`container ${s.main}`}>
        <div className={s.brandCol}>
          <Img file={ASSETS.logo} alt="Alive Luxury Retreats logo" sizes="140px" className={s.logo} />
          <ul className={s.social}>
            {SOCIAL.map((so) => (
              <li key={so.label}>
                <a href={so.href} target="_blank" rel="noopener noreferrer" aria-label={so.label}>
                  <Img file={so.icon} alt="" sizes="32px" />
                </a>
              </li>
            ))}
          </ul>
          <div className={s.contactLines}>
            <a href={`mailto:${CONTACT.email}`}><MailIcon size={16} /><span><span className="sr-only">Email: </span>{CONTACT.email}</span></a>
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /><span><span className="sr-only">WhatsApp: </span>{CONTACT.whatsappDisplay}</span></a>
          </div>
        </div>

        <LinkGroup id="footer-contact" title="Contact" label="Contact">
          <ul className={s.links}>
            <li><Link href="/book-call">Speak To Us</Link></li>
            <li><Link href="/instant-pricing-packages-chat">Chat With Us Here</Link></li>
            <li><Link href="/blog">Alive News</Link></li>
          </ul>
        </LinkGroup>

        <LinkGroup id="footer-nav" title="Navigation" label="Footer">
          <ul className={`${s.links} ${s.twoCol}`}>
            {FOOTER_NAV.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
          </ul>
        </LinkGroup>

        <LinkGroup id="footer-retreats" title="Retreats" label="More retreats">
          <ul className={`${s.links} ${s.small} ${s.twoCol}`}>
            {MORE.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
          </ul>
        </LinkGroup>
      </div>

      <div className={`container ${s.bottom}`}>
        <p className={s.legal}>
          <span>&copy; 2009 Alive Corporations.</span>
          <Link href="/booking-conditions">Booking Conditions</Link>
          <Link href="/nda">Non-Disclosure Agreement</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy Policy &amp; GDPR</Link>
        </p>
      </div>
    </footer>
  );
}
