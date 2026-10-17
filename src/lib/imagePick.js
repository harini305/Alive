// Matches original photographs to cards by their alt text (the source's own descriptions),
// so each card shows a photo of its subject rather than relying on DOM position alone.
import catalogue from '@/content/generated/images.json';
import { SHARED_IMAGES, TESTIMONIAL_IMAGES } from './site';
import { hasMedia, mediaWidth } from './media';

// Photos narrower than this look soft in card grids; they are skipped when a better one exists.
export const MIN_CARD_WIDTH = 400;

const STOP = new Set(['alive', 'luxury', 'retreat', 'retreats', 'program', 'programs', 'the', 'and', 'for', 'with', 'your', 'at', 'of', 'in', 'a', 'to', 'me', 'my', 'wellness', 'private', 'holistic', 'webp', 'jpg', 'png', 'small', 'resort', 'resorts']);
const SYN = { weightloss: ['weight', 'loss'], destress: ['stress'], burn: ['burnout', 'burn'], burnout: ['burnout', 'burn'], deep: ['rest', 'spa', 'relaxation'], rest: ['spa', 'relaxation', 'rest'], antiageing: ['ageing', 'aging', 'longevity'], ageing: ['longevity', 'anti'], recovery: ['recovery', 'healing', 'health'] };

export function tokens(text) {
  const out = new Set();
  for (const w of String(text || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)) {
    if (!w || STOP.has(w)) continue;
    out.add(w.replace(/s$/, ''));
    for (const x of SYN[w] || []) out.add(x);
  }
  return out;
}

const score = (alt, want) => { let n = 0; for (const t of tokens(alt)) if (want.has(t)) n++; return n; };

/**
 * cards: [{ want: string, img?: block }], pool: image blocks from the section.
 * Assigns pool images by best alt match (then by order), then fills gaps from the site catalogue.
 * `exclude` holds files already used elsewhere on the page.
 */
export function assignImages(cards, pool, exclude = new Set()) {
  const free = pool.filter((im) => !SHARED_IMAGES.has(im.file) && !TESTIMONIAL_IMAGES[im.file] && (!hasMedia(im.file) || mediaWidth(im.file) >= MIN_CARD_WIDTH));
  const wants = cards.map((c) => tokens(c.want));
  const result = cards.map(() => null);
  // 1) confident alt matches within the section
  const pairs = [];
  free.forEach((im, i) => wants.forEach((w, c) => { const sc = score(im.alt, w); if (sc > 0) pairs.push({ sc, i, c }); }));
  pairs.sort((a, b) => b.sc - a.sc);
  const usedImg = new Set();
  for (const p of pairs) if (!result[p.c] && !usedImg.has(p.i)) { result[p.c] = free[p.i]; usedImg.add(p.i); }
  // 2) remaining section images in order
  const rest = free.filter((_, i) => !usedImg.has(i));
  result.forEach((r, c) => { if (!r && rest.length) result[c] = rest.shift(); });
  // 3) gaps: best match from the site's original photography
  const taken = new Set([...exclude, ...result.filter(Boolean).map((r) => r.file)]);
  result.forEach((r, c) => {
    if (r) return;
    let best = null, bestSc = 0;
    for (const im of catalogue) {
      if (taken.has(im.file) || SHARED_IMAGES.has(im.file) || TESTIMONIAL_IMAGES[im.file] || !hasMedia(im.file) || mediaWidth(im.file) < MIN_CARD_WIDTH || /review|logo|icon|banner|pdf/.test(im.alt)) continue;
      const sc = score(im.alt, wants[c]);
      if (sc > bestSc) { best = im; bestSc = sc; }
    }
    if (best) { result[c] = { t: 'img', file: best.file, alt: best.alt.split(' | ')[0] }; taken.add(best.file); }
  });
  return result;
}
