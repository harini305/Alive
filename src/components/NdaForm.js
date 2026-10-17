'use client';
import { useEffect, useRef, useState } from 'react';
import { EMAIL_RE } from '@/lib/leads';
import s from './NdaForm.module.css';

const FIELDS = [
  { name: 'firstName', label: 'First name', type: 'text', ac: 'given-name' },
  { name: 'lastName', label: 'Last name', type: 'text', ac: 'family-name' },
  { name: 'email', label: 'Email', type: 'email', ac: 'email', extra: { spellCheck: false, autoCapitalize: 'off' } },
  { name: 'phone', label: 'Phone', type: 'tel', ac: 'tel' },
  { name: 'address', label: 'Address', type: 'text', ac: 'street-address', wide: true },
];

function DrawPad({ onChange }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2c2b28';
  }, []);
  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  return (
    <div className={s.padWrap}>
      <canvas
        ref={ref}
        id="nda-pad"
        className={s.pad}
        tabIndex={-1}
        aria-label="Signature drawing area"
        onPointerDown={(e) => { drawing.current = true; ref.current.setPointerCapture(e.pointerId); const ctx = ref.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(...pos(e)); }}
        onPointerMove={(e) => { if (!drawing.current) return; const ctx = ref.current.getContext('2d'); ctx.lineTo(...pos(e)); ctx.stroke(); onChange(true); }}
        onPointerUp={() => { drawing.current = false; }}
      />
      <button type="button" className={s.clear} onClick={() => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); onChange(false); }}>Clear</button>
    </div>
  );
}

/**
 * Rebuild of the NDA's digital-signature form. No e-signature backend is connected, so the
 * agreement is NOT executed or stored when submitted; the visitor is told so explicitly.
 */
export default function NdaForm() {
  const [v, setV] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', date: '', time: '', typed: '' });
  const [agree, setAgree] = useState(false);
  const [mode, setMode] = useState('type');
  const [drawn, setDrawn] = useState(false);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const formRef = useRef(null);
  const doneRef = useRef(null);
  useEffect(() => { if (done) doneRef.current?.focus(); }, [done]);
  const err = (k) => (errors[k] ? `nda-${k}-err` : undefined);
  const clear = (k) => { if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    FIELDS.forEach((f) => { if (!v[f.name].trim()) er[f.name] = `Please enter your ${f.label.toLowerCase()}.`; });
    if (v.email && !EMAIL_RE.test(v.email)) er.email = 'Please enter a valid email address.';
    if (!agree) er.agree = 'Please tick the box to confirm you agree.';
    if (mode === 'type' && !v.typed.trim()) er.sig = 'Please type your name as your signature.';
    if (mode === 'draw' && !drawn) er.sig = 'Please draw your signature.';
    if (mode === 'upload' && !file) er.sig = 'Please choose a signature image.';
    setErrors(er);
    const first = [...FIELDS.map((f) => f.name), 'agree', 'sig'].find((k) => er[k]);
    if (!first) { setDone(true); return; }
    const target = first === 'agree' ? '#nda-agree'
      : first === 'sig' ? (mode === 'type' ? '#nda-typed' : mode === 'upload' ? '#nda-file' : '#nda-pad')
      : `#nda-${first}`;
    formRef.current?.querySelector(target)?.focus();
  };

  if (done) {
    return (
      <div ref={doneRef} className={s.done} role="status" aria-live="polite" tabIndex={-1}>
        <p className={s.doneTitle}>Demo mode: the agreement was not signed or sent.</p>
        <p>This preview has no e-signature service connected, so nothing was stored and no agreement has been executed. Please contact the Alive team to complete the NDA.</p>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => setDone(false)}>Back to the form</button>
      </div>
    );
  }

  const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); clear(k === 'typed' ? 'sig' : k); };
  const errorCount = Object.values(errors).filter(Boolean).length;
  return (
    <form ref={formRef} noValidate onSubmit={submit} className={s.form}>
      <p className="sr-only" role="status" aria-live="polite">{errorCount ? `Please correct ${errorCount} ${errorCount === 1 ? 'field' : 'fields'} before submitting.` : ''}</p>
      <div className={s.grid}>
        {FIELDS.map((f) => (
          <div key={f.name} className={`field ${f.wide ? s.wide : ''}`} data-invalid={!!errors[f.name]}>
            <label htmlFor={`nda-${f.name}`}>{f.label}<span aria-hidden="true"> *</span></label>
            <input id={`nda-${f.name}`} name={f.name} type={f.type} autoComplete={f.ac} {...f.extra} value={v[f.name]} onChange={set(f.name)} required aria-required="true" aria-invalid={!!errors[f.name]} aria-describedby={err(f.name)} />
            {errors[f.name] && <span id={`nda-${f.name}-err`} className="field-error">{errors[f.name]}</span>}
          </div>
        ))}
        <div className="field">
          <label htmlFor="nda-date">Date</label>
          <input id="nda-date" name="date" type="date" value={v.date} onChange={set('date')} />
        </div>
        <div className="field">
          <label htmlFor="nda-time">Time</label>
          <input id="nda-time" name="time" type="time" value={v.time} onChange={set('time')} />
        </div>
      </div>

      <label className={s.check} data-invalid={!!errors.agree}>
        <input id="nda-agree" name="agree" type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); clear('agree'); }} required aria-required="true" aria-invalid={!!errors.agree} aria-describedby={err('agree')} />
        <span>By ticking this box I the RECEIVING PARTY have read, understand and agree to this agreement in full. I understand that by entering my details and ticking this box that this acts as a digital signature.<span aria-hidden="true"> *</span></span>
      </label>
      {errors.agree && <span id="nda-agree-err" className="field-error">{errors.agree}</span>}

      <fieldset className={s.sig} aria-describedby={err('sig')}>
        <legend>Signature<span aria-hidden="true"> *</span></legend>
        <div className={s.modes}>
          {['draw', 'type', 'upload'].map((m) => (
            <label key={m} className={s.mode}>
              <input type="radio" name="signature-mode" value={m} checked={mode === m} onChange={() => { setMode(m); clear('sig'); }} />
              <span>{m[0].toUpperCase() + m.slice(1)}</span>
            </label>
          ))}
        </div>
        {mode === 'type' && (
          <div className="field">
            <label htmlFor="nda-typed">Type your full name</label>
            <input id="nda-typed" name="signature" type="text" autoComplete="name" value={v.typed} onChange={set('typed')} className={s.typed} required aria-required="true" aria-invalid={!!errors.sig} aria-describedby={err('sig')} />
          </div>
        )}
        {mode === 'draw' && <DrawPad onChange={(x) => { setDrawn(x); if (x) clear('sig'); }} />}
        {mode === 'upload' && (
          <div className="field">
            <label htmlFor="nda-file">Signature image</label>
            <input id="nda-file" name="signatureImage" type="file" accept="image/*" onChange={(e) => { setFile(e.target.files?.[0] || null); clear('sig'); }} required aria-required="true" aria-invalid={!!errors.sig} aria-describedby={err('sig')} />
          </div>
        )}
        {errors.sig && <span id="nda-sig-err" className="field-error">{errors.sig}</span>}
      </fieldset>

      <button type="submit" className="btn btn-dark">Submit</button>
    </form>
  );
}
