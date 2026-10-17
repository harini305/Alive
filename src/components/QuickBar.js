'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { CONTACT } from '@/lib/site';
import { MailIcon, InfoIcon, PhoneIcon, WhatsAppIcon } from './Icons';
import s from './QuickBar.module.css';

// Mobile quick-action bar from the source site (06 §2): Email · Info · Call · WhatsApp.
// Floating WhatsApp + back-to-top are desktop/tablet only; on mobile the bar covers both jobs.
// data-menu-inert: the mobile menu makes these inert while it's open.
export default function QuickBar() {
  const [show, setShow] = useState(false);
  const topRef = useRef(null);
  const waRef = useRef(null);
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // the floating WhatsApp button steps aside once the footer (which has its own WhatsApp link) is in view
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { rootMargin: '0px 0px -40px 0px' });
    io.observe(footer);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(waRef.current, { autoAlpha: atFooter ? 0 : 1, scale: atFooter ? 0.85 : 1, y: atFooter ? 10 : 0, duration: reduce ? 0 : 0.35, ease: 'power2.out' });
  }, [atFooter]);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(topRef.current, { autoAlpha: show ? 1 : 0, y: show || reduce ? 0 : 12, duration: reduce ? 0 : 0.4, ease: 'power2.out' });
  }, [show]);

  return (
    <>
      <nav className={s.bar} aria-label="Quick actions" data-menu-inert>
        <a href={CONTACT.mobileMail}><MailIcon /><span>Email</span></a>
        <Link href="/download"><InfoIcon /><span>Info</span></Link>
        <a href={CONTACT.usTel}><PhoneIcon /><span>Call</span></a>
        <a href={CONTACT.whatsappApi} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /><span>WhatsApp</span></a>
      </nav>
      <a ref={waRef} className={s.wa} data-menu-inert href={CONTACT.whatsappUrl} tabIndex={atFooter ? -1 : undefined} aria-hidden={atFooter || undefined} target="_blank" rel="noopener noreferrer" aria-label={`Chat on WhatsApp ${CONTACT.whatsappDisplay}`}>
        <WhatsAppIcon size={28} />
      </a>
      <button
        ref={topRef}
        type="button"
        className={s.top}
        data-menu-inert
        style={{ opacity: 0, visibility: 'hidden' }}
        onClick={() => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0 }))}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 9l5-5 5 5M3 14l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
      </button>
    </>
  );
}
