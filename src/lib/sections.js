// Turns a captured page (sections of raw blocks in DOM order) into typed sections that the
// layout components render. Detection is based on the recurring Wix section templates listed in
// the audit (01 §3). Anything unrecognised falls through to the 'editorial' layout, so no
// captured text is ever dropped.
import { SHARED_IMAGES, TESTIMONIAL_IMAGES, CONTACT } from './site';

const isH = (b, lvl) => b.t === 'h' && (lvl ? b.level === lvl : true);
const firstH = (s) => s.blocks.find((b) => b.t === 'h');
const htext = (s) => (firstH(s)?.text || '').toLowerCase();
const paras = (s) => s.blocks.filter((b) => b.t === 'p');
const imgs = (s) => s.blocks.filter((b) => b.t === 'img');
const count = (s, pred) => s.blocks.filter(pred).length;

const SYSTEM_LIST_START = 'Exclusive Private Retreat Experience World Class';

export function resolveHref(link, route) {
  let href = link.href;
  const t = (link.text || '').toLowerCase();
  if (href && href === route) {
    // Self-referencing CTAs on the source (07 A5/A6) are pointed at the relevant in-page section.
    if (/team/.test(t)) return '#team';
    if (/package|pricing|info|pdf/.test(t)) return '#packages';
    if (/quote|call|book/.test(t)) return '#callback';
    return '#top';
  }
  if (href) return href;
  if (/whatsapp/.test(t)) return CONTACT.whatsappUrl;
  if (/package|pdf|pricing|price/.test(t)) return '/download';
  if (/quote/.test(t)) return '/get-a-quote';
  if (/call|speak|book|consult/.test(t)) return '/book-call';
  if (/chat/.test(t)) return '/instant-pricing-packages-chat';
  return '/contact';
}

function detect(s, i, all, page) {
  const b = s.blocks;
  const h = htext(s);
  const ps = paras(s).map((p) => p.text);
  if (s.id === 'None' && b.some((x) => isH(x, 2) && /speak with your client manager|interview|heidi|pre-retreat/i.test(x.text))) return 'skip';
  const txt = b.filter((x) => x.t === 'p' || (x.t === 'h' && x.level >= 3)).map((x) => x.text);
  if (txt[0] === 'Holistic' && txt.length >= 8 && txt.length <= 12 && txt.every((p) => p.length < 50)) return 'usp';
  if (b.some((x) => x.t === 'btn' && /play video/i.test(x.text)) && !ps.length) return 'video';
  if (b.length === 1 && b[0].t === 'btn' && /play video/i.test(b[0].text)) return 'video';
  if (['Facebook', 'Twitter', 'Pinterest'].every((w) => ps.includes(w))) return 'skip'; // Wix share-widget residue
  if (ps.some((p) => p.startsWith(SYSTEM_LIST_START))) return 'systemList';
  if (b.some((x) => x.t === 'field' && x.type === 'email') && b.some((x) => x.t === 'btn')) return 'leadForm';
  if (/request a confidential call/.test(h)) return 'callback';
  if (/looking for personalised support/.test(h)) return 'support';
  if (/^client reviews/.test(h)) return 'reviews';
  if (/^luxury private accommodation$/.test(h) && ps.length <= 4 && imgs(s).length <= 1 && /choose your level/i.test(htext(all[i + 1] || { blocks: [] }))) return 'accommodationIntro';
  if (/choose your level of luxury/.test(h)) return 'levels';
  if (count(s, (x) => isH(x, 6)) >= 2 && count(s, (x) => isH(x, 3)) >= 2) return 'focus';
  if (/^meet your team$/.test(h) && count(s, (x) => isH(x, 4)) >= 6) return 'team';
  if (count(s, (x) => isH(x, 2)) >= 3 && count(s, (x) => isH(x, 4)) >= 8 && count(s, (x) => isH(x, 3)) >= 8) return 'pillars';
  if (b.length && b.every((x) => x.t === 'li' || x.t === 'h') && b.some((x) => x.t === 'li' && /^speak with your client manager/i.test(x.text))) return 'bookingCard';
  if (page.route !== '/blog' && b.filter((x) => isH(x, 2)).length >= 2 && b.some((x) => x.t === 'link' && x.text === '2')) return 'blogStrip';
  if (/^gallery$/.test(h) || (imgs(s).length >= 6 && ps.length <= 2 && count(s, (x) => isH(x, 3)) < 3)) return 'gallery';
  // card grids: several h3 titles each followed by h4/p copy
  const h3s = count(s, (x) => isH(x, 3));
  if (h3s >= 3 && imgs(s).length >= 3) return 'cards';
  if (b.length && b.every((x) => x.t === 'link' || x.t === 'img') && b.some((x) => x.t === 'link') && !imgs(s).length) return 'cta';
  if (!firstH(s) && ps.length >= 1 && ps.length <= 6 && ps.every((p) => p.length < 260) && !b.some((x) => x.t === 'li')) return 'statement';
  return 'editorial';
}

// Wix sometimes stores a section's heading at the end of the previous strip. Headings that close
// a section (with nothing but links/images after them) are moved to the start of the next one.
function liftTrailingHeadings(sections) {
  const out = sections.map((s) => ({ ...s, blocks: [...s.blocks] }));
  for (let i = 0; i < out.length - 1; i++) {
    const b = out[i].blocks;
    let j = b.length;
    while (j > 0 && (b[j - 1].t === 'link' || b[j - 1].t === 'img')) j--;
    let k = j;
    while (k > 0 && b[k - 1].t === 'h' && b[k - 1].level >= 2) k--;
    const hasBodyBefore = b.slice(0, k).some((x) => x.t === 'p' || x.t === 'li');
    const next = out[i + 1];
    const nextStartsWithHeading = next.blocks.find((x) => x.t !== 'img')?.t === 'h';
    if (k < j && hasBodyBefore && !nextStartsWithHeading && next.id !== 'None') {
      const moved = b.splice(k, j - k);
      next.blocks.unshift(...moved);
    }
  }
  return out;
}

export function buildSections(page) {
  const raw = liftTrailingHeadings(page.sections);
  // the hero is the section holding the page's first H1; anything before it folds into it
  const heroIdx = raw.findIndex((s) => s.blocks.some((b) => isH(b, 1)));
  const out = [];
  if (heroIdx >= 0) {
    const pre = raw.slice(0, heroIdx + 1);
    const blocks = pre.flatMap((s) => s.blocks);
    out.push({ type: 'hero', id: raw[heroIdx].id, blocks });
  }
  const rest = heroIdx >= 0 ? raw.slice(heroIdx + 1) : raw;
  rest.forEach((s, i) => {
    const type = detect(s, i, rest, page);
    if (type === 'skip') return;
    out.push({ type, id: s.id, blocks: s.blocks });
  });

  // merge pairs that read as one composition
  const merged = [];
  for (let i = 0; i < out.length; i++) {
    const s = out[i];
    const prev = merged[merged.length - 1];
    if (s.type === 'systemList' && prev) {
      if (prev.type === 'editorial' || prev.type === 'statement') { prev.type = 'system'; prev.listBlocks = s.blocks; continue; }
      merged.push({ ...s, type: 'system', listBlocks: s.blocks, blocks: [] });
      continue;
    }
    if (s.type === 'levels' && prev?.type === 'accommodationIntro') { prev.type = 'levels'; prev.introBlocks = prev.blocks; prev.blocks = s.blocks; continue; }
    merged.push(s);
  }
  return merged.map((s, i) => ({ ...s, type: s.type === 'accommodationIntro' ? 'editorial' : s.type, index: i }));
}

// Helpers for renderers ---------------------------------------------------------------
// USP strip: label / sub-line pairs (some sub-lines were split across two text boxes)
const USP_LABELS = new Set(['Holistic', 'Private', 'Life Changing', 'Expert', 'EXPERT', 'Luxury', 'Custom', 'Skill', 'Support', '5 Star']);
export function uspItems(blocks) {
  const txt = blocks.filter((x) => x.t === 'p' || (x.t === 'h' && x.level >= 3)).map((x) => x.text);
  const items = [];
  for (const t of txt) {
    if (USP_LABELS.has(t) || !items.length) items.push({ label: t, sub: [] });
    else items[items.length - 1].sub.push(t);
  }
  return items.map((i) => ({ label: i.label, sub: i.sub.join(' ') }));
}

export const CHECK_RE = /✓|✔️|✔/;
export function splitChecks(text) {
  if (!CHECK_RE.test(text)) return null;
  return text.split(/✓|✔️|✔/).map((t) => t.trim()).filter(Boolean);
}

export function contentImages(blocks) {
  return blocks.filter((b) => b.t === 'img' && !SHARED_IMAGES.has(b.file) && !TESTIMONIAL_IMAGES[b.file]);
}

export function heroImage(page, section) {
  const own = section && contentImages(section.blocks)[0];
  if (own) return own;
  const extra = (page.extraImages || []).find((x) => !SHARED_IMAGES.has(x.file) && !TESTIMONIAL_IMAGES[x.file]);
  if (extra) return extra;
  for (const s of page.sections) {
    const im = contentImages(s.blocks)[0];
    if (im) return im;
  }
  return null;
}

/**
 * Typographic polish applied at render time: straight quotes become curly, runs of dots become
 * an ellipsis and a spaced hyphen becomes an en dash. Plain text in, plain text out.
 */
export function smartText(text) {
  if (!text) return text;
  return String(text)
    .replace(/\.{3,}/g, '…')
    .replace(/ +- +/g, ' – ')
    .replace(/(\w)'(\w)/g, '$1’$2')
    .replace(/(^|[\s([{“—–-])'/g, '$1‘')
    .replace(/'/g, '’')
    .replace(/(^|[\s([{‘—–-])"/g, '$1“')
    .replace(/"/g, '”');
}
