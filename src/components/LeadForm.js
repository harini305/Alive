'use client';
import { useId, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { submitLead, EMAIL_RE, mailtoFor, whatsappFor } from '@/lib/leads';
import { PDFS } from '@/lib/site';
import { Arrow, DownloadIcon, MailIcon, WhatsAppIcon } from './Icons';
import s from './LeadForm.module.css';

// Field sets mirror the original Wix forms (06 §3).
const FORMS = {
  pdf: {
    subject: 'PDF Packages & Pricing request',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    ],
  },
  callback: {
    subject: 'Confidential call back request',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    ],
  },
  quote: {
    subject: 'Custom package request',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
      { name: 'dates', label: 'Preferred Dates and Length of Stay', type: 'text', wide: true, placeholder: 'e.g. March 2027, 7 nights' },
    ],
  },
};

export default function LeadForm({ form = 'pdf', submitLabel, dark = false, layout = 'stack', id }) {
  const cfg = FORMS[form];
  const uid = useId();
  const [values, setValues] = useState(() => Object.fromEntries(cfg.fields.map((f) => [f.name, ''])));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | demo | error
  const result = useRef(null);
  const formRef = useRef(null);

  const validate = () => {
    const e = {};
    for (const f of cfg.fields) {
      const v = values[f.name].trim();
      if (!v) e[f.name] = `Please enter your ${f.label.toLowerCase()}.`;
      else if (f.type === 'email' && !EMAIL_RE.test(v)) e[f.name] = 'Please enter a valid email address, e.g. name@example.com.';
    }
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = formRef.current?.querySelector(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    setStatus('sending');
    try {
      const r = await submitLead(form, values);
      setStatus(r.demo ? 'demo' : 'sent');
    } catch {
      setStatus('error');
    }
    requestAnimationFrame(() => {
      if (result.current) {
        gsap.fromTo(result.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' });
        result.current.focus();
      }
    });
  };

  const labelled = Object.fromEntries(cfg.fields.map((f) => [f.label, values[f.name]]));

  if (status === 'demo' || status === 'sent') {
    return (
      <div ref={result} tabIndex={-1} className={`${s.result} ${dark ? 'on-dark' : ''}`} role="status" aria-live="polite">
        {status === 'sent' ? (
          <p className={s.resultTitle}>Thank you, {values.firstName}. Your request has been received.</p>
        ) : (
          <>
            <p className={s.resultTitle}>Demo mode: your details were not sent.</p>
            <p className={s.resultText}>
              This preview isn&rsquo;t connected to Alive&rsquo;s enquiry inbox yet. {form === 'pdf' ? 'You can open the packages directly below, or send' : 'Send'} the same details to the team in one tap:
            </p>
          </>
        )}
        {form === 'pdf' && (
          <ul className={s.pdfs}>
            <li><a href={PDFS.packages.href} target="_blank" rel="noopener" className={s.pdfLink}><DownloadIcon /> {PDFS.packages.label} <span>PDF</span></a></li>
            <li><a href={PDFS.vip.href} target="_blank" rel="noopener" className={s.pdfLink}><DownloadIcon /> {PDFS.vip.label} <span>PDF</span></a></li>
          </ul>
        )}
        {status === 'demo' && (
          <div className={s.resultActions}>
            <a className="btn btn-sm" href={mailtoFor(cfg.subject, labelled)}><MailIcon size={16} /> Email the team</a>
            <a className={`btn btn-sm ${dark ? 'btn-light' : 'btn-outline'}`} href={whatsappFor(`${cfg.subject}\n${Object.entries(labelled).map(([k, v]) => `${k}: ${v}`).join('\n')}`)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> WhatsApp</a>
          </div>
        )}
        <button type="button" className={s.reset} onClick={() => setStatus('idle')}>Edit details</button>
      </div>
    );
  }

  return (
    <form ref={formRef} id={id} noValidate onSubmit={onSubmit} className={`${s.form} ${s[layout]} ${dark ? 'on-dark' : ''}`}>
      {cfg.fields.map((f) => (
        <div key={f.name} className={`field ${f.wide ? s.wide : ''}`} data-invalid={!!errors[f.name]}>
          <label htmlFor={`${uid}-${f.name}`}>{f.label}<span aria-hidden="true"> *</span></label>
          <input
            id={`${uid}-${f.name}`}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            {...(f.type === 'email' ? { spellCheck: false, autoCapitalize: 'off' } : {})}
            required
            aria-required="true"
            aria-invalid={!!errors[f.name]}
            aria-describedby={errors[f.name] ? `${uid}-${f.name}-err` : undefined}
            value={values[f.name]}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.name]: e.target.value }));
              if (errors[f.name]) setErrors((er) => ({ ...er, [f.name]: undefined }));
            }}
          />
          {errors[f.name] && <span id={`${uid}-${f.name}-err`} className="field-error">{errors[f.name]}</span>}
        </div>
      ))}
      <div className={s.submitRow}>
        <button type="submit" className={`btn ${dark ? '' : 'btn-dark'} ${s.submit}`} disabled={status === 'sending'} aria-busy={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : submitLabel}
          {status !== 'sending' && <Arrow />}
        </button>
        {status === 'error' && <p className="field-error" role="alert">Something went wrong. Please try again, or email the team directly.</p>}
      </div>
    </form>
  );
}
