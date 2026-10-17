'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { NAV, CONTACT, TAGLINE } from '@/lib/site';
import { ASSETS } from '@/lib/site';
import Img from './ClientImg';
import { WhatsAppIcon } from './Icons';
import s from './Header.module.css';

const isExternal = (href) => /^(https?:|tel:|mailto:)/.test(href);

function NavLink({ item, className, onClick, ...rest }) {
  if (isExternal(item.href)) {
    return <a href={item.href} className={className} onClick={onClick} {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>{item.label}</a>;
  }
  return <Link href={item.href} className={className} onClick={onClick} {...rest}>{item.label}</Link>;
}

function Dropdown({ item, pathname, open, setOpen, idx }) {
  const panel = useRef(null);
  const active = item.children.some((c) => c.href === pathname) || item.href === pathname;
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    const items = el.querySelectorAll('li');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      gsap.killTweensOf([el, items]);
      gsap.set(el, { display: 'block' });
      gsap.fromTo(el, { autoAlpha: 0, y: reduce ? 0 : -8 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.35, ease: 'power2.out' });
      gsap.fromTo(items, { autoAlpha: 0, x: reduce ? 0 : -10 }, { autoAlpha: 1, x: 0, duration: reduce ? 0 : 0.4, stagger: reduce ? 0 : 0.035, ease: 'power2.out', delay: reduce ? 0 : 0.05 });
    } else {
      gsap.to(el, { autoAlpha: 0, y: reduce ? 0 : -6, duration: reduce ? 0 : 0.2, ease: 'power1.in', onComplete: () => gsap.set(el, { display: 'none' }) });
    }
  }, [open]);

  return (
    <li
      className={s.item}
      onMouseEnter={() => setOpen(idx)}
      onMouseLeave={() => setOpen(null)}
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(null); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null); }}
    >
      <button
        type="button"
        className={`${s.link} ${active ? s.active : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(open ? null : idx)}
      >
        {item.label}
        <svg className={s.caret} viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" /></svg>
      </button>
      <div ref={panel} className={s.panel} style={{ display: 'none' }}>
        <ul>
          {item.children.map((c) => (
            <li key={c.label}>
              <NavLink item={c} className={`${s.panelLink} ${c.href === pathname ? s.panelActive : ''}`} onClick={() => setOpen(null)} />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled])';

function MobileMenu({ open, onClose, pathname, burger }) {
  const root = useRef(null);
  const restore = useRef(false);
  const [group, setGroup] = useState(null);
  const dismiss = useCallback(() => { restore.current = true; onClose(); }, [onClose]);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-mi]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      gsap.set(el, { display: 'flex' });
      if (reduce) { gsap.set(el, { autoAlpha: 1, clipPath: 'none' }); gsap.set(items, { autoAlpha: 1, y: 0 }); return; }
      const tl = gsap.timeline();
      tl.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)', autoAlpha: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut' })
        .fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.045, ease: 'expo.out' }, 0.35); // opacity (not autoAlpha) so focus can land immediately
      return () => tl.kill();
    }
    if (reduce) { gsap.set(el, { display: 'none' }); return; }
    const tl = gsap.timeline({ onComplete: () => gsap.set(el, { display: 'none' }) });
    tl.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' });
    return () => tl.kill();
  }, [open]);

  // modal: focus moves in, Tab is trapped, the page behind is inert, focus returns to the burger on dismiss
  useEffect(() => {
    if (!open) return;
    const el = root.current;
    const visible = () => [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden');
    const onKey = (e) => {
      if (e.key === 'Escape') { dismiss(); return; }
      if (e.key !== 'Tab') return;
      const f = visible();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], cur = document.activeElement;
      if (e.shiftKey && (cur === first || !el.contains(cur))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (cur === last || !el.contains(cur))) { e.preventDefault(); first.focus(); }
    };
    const outside = document.querySelectorAll('#main, footer, [data-menu-inert]');
    outside.forEach((n) => n.setAttribute('inert', ''));
    restore.current = false;
    el.querySelector(`nav ${FOCUSABLE}`)?.focus({ preventScroll: true });
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => {
      document.removeEventListener('keydown', onKey);
      outside.forEach((n) => n.removeAttribute('inert'));
      document.body.style.overflow = '';
      window.__lenis?.start();
      if (restore.current) burger.current?.focus({ preventScroll: true });
    };
  }, [open, dismiss, burger]);

  return (
    <div ref={root} id="mobile-menu" data-lenis-prevent className={s.mobile} style={{ display: 'none' }} role="dialog" aria-modal="true" aria-label="Site menu">
      <button type="button" className={s.mClose} onClick={dismiss} data-mi>
        Close<span className={s.mCloseX} aria-hidden="true" />
      </button>
      <nav className={s.mobileNav} aria-label="Mobile">
        <ul>
          {NAV.map((item, i) => (
            <li key={item.label} data-mi className={s.mItem}>
              {item.children ? (
                <>
                  <button type="button" className={s.mLink} aria-expanded={group === i} onClick={() => setGroup(group === i ? null : i)}>
                    {item.label}<span className={s.mPlus} data-open={group === i} aria-hidden="true" />
                  </button>
                  <MobileGroup open={group === i}>
                    {item.children.map((c) => (
                      <li key={c.label}><NavLink item={c} className={`${s.mSub} ${c.href === pathname ? s.mSubActive : ''}`} onClick={onClose} /></li>
                    ))}
                  </MobileGroup>
                </>
              ) : (
                <NavLink item={item} className={`${s.mLink} ${item.href === pathname ? s.mActive : ''}`} onClick={onClose} />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className={s.mFoot} data-mi>
        <a className="btn btn-sm" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> WhatsApp {CONTACT.whatsappDisplay}</a>
        <a className={s.mMail} href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      </div>
    </div>
  );
}

function MobileGroup({ open, children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) gsap.fromTo(el, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: reduce ? 0 : 0.5, ease: 'power3.out' });
    else gsap.to(el, { height: 0, autoAlpha: 0, duration: reduce ? 0 : 0.35, ease: 'power2.inOut' });
  }, [open]);
  return <ul ref={ref} className={s.mGroup} style={{ height: 0, opacity: 0, visibility: 'hidden' }}>{children}</ul>;
}

export default function Header() {
  const pathname = usePathname();
  const bar = useRef(null);
  const burger = useRef(null);
  const lastDir = useRef(0);
  const [open, setOpen] = useState(null);
  const [menu, setMenu] = useState(false);
  // null = not measured yet; CSS (body:has([data-hero-dark])) styles the first paint so there's no flash
  const [overlay, setOverlay] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setMenu(false), []);

  // Is the page opening on a dark full-bleed hero? Then the bar starts transparent with light text.
  useLayoutEffect(() => {
    setOpen(null);
    setMenu(false);
    const check = () => setOverlay(!!document.querySelector('[data-hero-dark]'));
    check();
    const t = setTimeout(check, 50);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const el = bar.current;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        setScrolled(y > 40);
        if (mq.matches) return;
        const dir = y > 420 ? self.direction : -1;
        if (dir !== lastDir.current) {
          lastDir.current = dir;
          gsap.to(el, { yPercent: dir === 1 ? -100 : 0, duration: 0.5, ease: dir === 1 ? 'power2.in' : 'power3.out', overwrite: true });
        }
      },
    });
    return () => { st.kill(); gsap.set(el, { yPercent: 0 }); };
  }, []);

  useEffect(() => { if (menu) gsap.to(bar.current, { yPercent: 0, duration: 0.3, overwrite: true }); }, [menu]);

  // keyboard focus landing in the slid-away header brings it back
  const reveal = () => {
    if (lastDir.current !== 1) return;
    lastDir.current = -1;
    gsap.to(bar.current, { yPercent: 0, duration: 0.3, ease: 'power3.out', overwrite: true });
  };

  const theme = menu ? 'menu' : scrolled ? 'solid' : overlay === null ? 'auto' : overlay ? 'overlay' : 'solid';

  return (
    <>
    <header ref={bar} className={s.header} data-theme={theme} data-scrolled={scrolled} onFocus={reveal}>
      <div className={s.inner}>
        <Link href="/" className={s.brand} aria-label="Alive Luxury Wellness Retreats — home">
          <Img file={ASSETS.logo} alt="" sizes="(max-width: 767px) 68px, 86px" priority className={s.logo} />
          <span className={s.brandText}>
            <span className={s.brandName}>Alive Luxury Wellness Retreats</span>
            <span className={s.tagline}>{TAGLINE}</span>
          </span>
        </Link>

        <nav className={s.nav} aria-label="Main">
          <ul className={s.list}>
            {NAV.map((item, i) => item.label === 'Contact Us' ? null :
              item.children ? (
                <Dropdown key={item.label} item={item} idx={i} pathname={pathname} open={open === i} setOpen={setOpen} />
              ) : (
                <li key={item.label} className={s.item}>
                  <NavLink item={item} className={`${s.link} ${pathname === item.href ? s.active : ''}`} aria-current={pathname === item.href ? 'page' : undefined} />
                </li>
              )
            )}
          </ul>
        </nav>

        <div className={s.actions}>
          <Link href="/contact" className={`btn btn-sm ${s.cta} ${pathname === '/contact' ? s.ctaActive : ''}`}>Contact Us</Link>
          <button ref={burger} type="button" className={s.burger} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
            <span className="sr-only">{menu ? 'Close menu' : 'Open menu'}</span>
            <span className={s.burgerLines} data-open={menu} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
    </header>
    <MobileMenu open={menu} onClose={closeMenu} pathname={pathname} burger={burger} />
    </>
  );
}
