// Lead submission. The original site posts to Wix Forms (+ Omnisend automations), which a
// standalone frontend cannot reach. If NEXT_PUBLIC_LEAD_ENDPOINT is configured the payload is
// POSTed there; otherwise the call resolves as { demo: true } and NOTHING is sent anywhere.
import { CONTACT } from './site';

export const LEAD_ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT || '';

export async function submitLead(form, values) {
  if (!LEAD_ENDPOINT) {
    await new Promise((r) => setTimeout(r, 650));
    return { ok: false, demo: true };
  }
  const res = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form, ...values, page: typeof window !== 'undefined' ? window.location.pathname : null }),
  });
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  return { ok: true, demo: false };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function mailtoFor(subject, values) {
  const body = Object.entries(values).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function whatsappFor(text) {
  return `${CONTACT.whatsappUrl}?text=${encodeURIComponent(text)}`;
}
