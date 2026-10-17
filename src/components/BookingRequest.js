'use client';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { mailtoFor, whatsappFor, EMAIL_RE } from '@/lib/leads';
import { MailIcon, WhatsAppIcon } from './Icons';
import s from './BookingRequest.module.css';

// Wix Bookings (live availability, staff calendars, confirmations) cannot run outside Wix.
// This interface lets a visitor choose a preferred day and time, then sends that request to the
// team by email or WhatsApp. It never claims a slot is reserved.
// dates are rendered on the client only, so the visitor's own locale is used
const fmtLong = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const fmtMonth = new Intl.DateTimeFormat(undefined, { month: 'short' });

const TIMES = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function BookingRequest({ service }) {
  // dates depend on the visitor's clock, so they are built on the client only
  const [days, setDays] = useState([]);
  const [tz, setTz] = useState('');
  useEffect(() => {
    const out = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 1; out.length < 14; i++) {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      out.push(x);
    }
    setDays(out);
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
  }, []);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [ready, setReady] = useState(false);
  const timesRef = useRef(null);
  const formRef = useRef(null);
  const id = (k) => `bk-${k}-${service.slug}`;
  const clear = (k) => { if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined })); };

  useLayoutEffect(() => {
    if (day && timesRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(timesRef.current.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.4, ease: 'power2.out' });
    }
  }, [day]);

  const fmt = (d) => fmtLong.format(d);
  const details = day && time ? { Service: `${service.name} (${service.duration})`, 'Preferred time': `${fmt(day)} at ${time} (${tz})`, Name: name, Email: email } : {};

  const confirm = (e) => {
    e.preventDefault();
    const er = {};
    if (!day) er.day = 'Please choose a day.';
    else if (!time) er.time = 'Please choose a time.';
    if (!name.trim()) er.name = 'Please enter your name.';
    if (!email.trim()) er.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(email)) er.email = 'Please enter a valid email address, e.g. name@example.com.';
    setErrors(er);
    const first = ['day', 'time', 'name', 'email'].find((k) => er[k]);
    if (first) {
      const sel = { day: `#${id('days')} button`, time: `#${id('times')} button`, name: `#${id('name')}`, email: `#${id('email')}` }[first];
      formRef.current?.querySelector(sel)?.focus();
      return;
    }
    setReady(true);
  };

  return (
    <div className={s.wrap}>
      <div className={s.head}>
        <p className={s.svc}>{service.name}</p>
        <p className={s.note}>Live availability isn&rsquo;t connected in this preview. Choose your preferred time and we&rsquo;ll pass the request to the team; your call is confirmed once they reply.</p>
      </div>
      <form ref={formRef} className={s.body} onSubmit={confirm} noValidate>
        <fieldset className={s.fs} aria-describedby={errors.day ? id('day-err') : undefined}>
          <legend>1 · Choose a day</legend>
          <div className={s.days} id={id('days')}>
            {days.map((d) => {
              const sel = day && d.getTime() === day.getTime();
              return (
                <button key={d.toISOString()} type="button" className={s.day} aria-pressed={!!sel} onClick={() => { setDay(d); setTime(null); setReady(false); clear('day'); }}>
                  <span>{fmtWeekday.format(d)}</span>
                  <strong className="tnum">{d.getDate()}</strong>
                  <span>{fmtMonth.format(d)}</span>
                </button>
              );
            })}
          </div>
          {errors.day && <p id={id('day-err')} className="field-error">{errors.day}</p>}
        </fieldset>
        <fieldset className={s.fs} disabled={!day} aria-describedby={errors.time ? id('time-err') : undefined}>
          <legend>2 · Choose a time {tz && <small>({tz})</small>}</legend>
          <div className={s.times} ref={timesRef} id={id('times')}>
            {TIMES.map((t) => (
              <button key={t} type="button" className={`${s.time} tnum`} aria-pressed={time === t} onClick={() => { setTime(t); setReady(false); clear('time'); }}>{t}</button>
            ))}
          </div>
          {errors.time && <p id={id('time-err')} className="field-error">{errors.time}</p>}
        </fieldset>
        <fieldset className={s.fs}>
          <legend>3 · Your details</legend>
          <div className={s.fields}>
            <div className="field" data-invalid={!!errors.name}>
              <label htmlFor={id('name')}>Name<span aria-hidden="true"> *</span></label>
              <input id={id('name')} name="name" value={name} onChange={(e) => { setName(e.target.value); clear('name'); }} autoComplete="name" required aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? id('name-err') : undefined} />
              {errors.name && <span id={id('name-err')} className="field-error">{errors.name}</span>}
            </div>
            <div className="field" data-invalid={!!errors.email}>
              <label htmlFor={id('email')}>Email<span aria-hidden="true"> *</span></label>
              <input id={id('email')} name="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); clear('email'); }} autoComplete="email" spellCheck={false} autoCapitalize="off" required aria-required="true" aria-invalid={!!errors.email} aria-describedby={errors.email ? id('email-err') : undefined} />
              {errors.email && <span id={id('email-err')} className="field-error">{errors.email}</span>}
            </div>
          </div>
        </fieldset>
        <p className="sr-only" role="status" aria-live="polite">{Object.values(errors).filter(Boolean).length ? 'Please check the highlighted fields.' : ''}</p>
        {!ready ? (
          <button type="submit" className="btn btn-dark">Request This Time</button>
        ) : (
          <div className={s.ready} role="status">
            <p><strong>Not booked yet.</strong> Send this request to the Alive team to confirm: {details['Preferred time']}.</p>
            <div className={s.readyActions}>
              <a className="btn btn-sm btn-dark" href={mailtoFor(`Booking request: ${service.name}`, details)}><MailIcon size={16} /> Send by email</a>
              <a className="btn btn-sm btn-outline" href={whatsappFor(`Booking request\n${Object.entries(details).map(([k, v]) => `${k}: ${v}`).join('\n')}`)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> Send on WhatsApp</a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
