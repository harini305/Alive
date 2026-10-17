// Converts the verbatim audit captures (docs/source-audit/content/*.md) into structured JSON
// that the Next.js pages render. Text is copied as captured; nothing is rewritten here.
// Output: src/content/generated/{pages/<key>.json, routes.json, faq.json, posts.json}
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const audit = path.join(root, 'docs', 'source-audit');
const outDir = path.join(root, 'src', 'content', 'generated');
fs.mkdirSync(path.join(outDir, 'pages'), { recursive: true });

const SITE = 'https://www.aliveluxuryretreats.com';
const pagesMeta = JSON.parse(fs.readFileSync(path.join(audit, 'data', 'pages.json'), 'utf8'));

// Legacy redirects (06 §2). The dead chain /copy-of-de-stress-retreats is pointed at the live burnout page.
export const REDIRECTS = {
  '/australia': '/wellness-retreat-australia',
  '/book': '/get-a-quote',
  '/luxury-detox-cleanse-retreat': '/detox-cleanse-retreat',
  '/luxury-health-wellness-spa-retreat': '/wellness-retreat-programs',
  '/vip-private-luxury-mental-health-retreat-facilities': '/',
  '/copy-of-de-stress-retreats': '/de-stress-burn-out-retreat',
  '/private-executive-burn-out-recovery-retreat': '/de-stress-burn-out-retreat',
};

const clean = (s) => s.replace(/[​‌‍﻿]/g, '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();

function normHref(href) {
  if (!href) return null;
  href = href.trim();
  if (/^https?:\/\/(www\.)?aliveluxuryretreats\.com/i.test(href)) {
    let p = href.replace(/^https?:\/\/(www\.)?aliveluxuryretreats\.com/i, '') || '/';
    p = p.split('#')[0].split('?')[0] || '/';
    if (p.length > 1) p = p.replace(/\/$/, '');
    if (REDIRECTS[p]) p = REDIRECTS[p];
    return p;
  }
  if (/^http:\/\/(Apps\.Courses|volcano\.You)/i.test(href)) return null; // malformed auto-links (07 A3)
  return href;
}

// ---------- asset map ----------
const assetMap = {}; // route -> [{file, dims, ids, alt, under}]
{
  const md = fs.readFileSync(path.join(audit, 'data', 'page-asset-map.md'), 'utf8').replace(/\r/g, '');
  let route = null;
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const h = line.match(/^## `([^`]+)`/);
    if (h) { route = h[1]; assetMap[route] = []; continue; }
    if (!route || !line.startsWith('| `')) continue;
    // rows may wrap when alt text contains a newline
    while (!/\|\s*$/.test(line) && i + 1 < lines.length) line += ' ' + lines[++i];
    const cells = line.split('|').map((c) => c.trim());
    const file = cells[1].replace(/`/g, '');
    const ids = cells[3].split(',').map((s) => s.trim()).filter(Boolean);
    const ctx = cells.slice(4, -1).join('|');
    const m = ctx.split(/\s*· under: /);
    assetMap[route].push({ file, dims: cells[2], ids, alt: clean(m[0] || ''), under: clean(m[1] || '') });
  }
}

// ---------- parse a capture ----------
const HEADER_TEXTS = new Set(['', 'ALIVE LUXURY WELLNESS RETREATS', 'Whatsapp', 'ENQUIRY', 'Home', 'About', 'FAQ', 'Alive News', '360 Holistic Wellness', 'Detox', 'Burn Out Retreats', 'Mental Health Retreats', 'Anxiety Retreat', 'Depression Retreat', 'Grief Retreat', 'Trauma Retreat', 'Luxury Bali Retreat', 'Luxury Mexico Retreat', 'PDF Packages', 'Contact Us', 'Speak To A Retreat Advisor', 'Chat Here', 'Call', 'Book A Discovery Call', 'Request A Quote']);

function parseLinks(md) {
  const part = md.split('## Links on page')[1];
  if (!part) return [];
  const rows = part.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Text') && !l.startsWith('|---'));
  let links = rows.map((r) => {
    const c = r.split('|').map((x) => x.trim());
    return { text: clean(c[1]), href: c[2], target: c[3] };
  });
  // strip shared header (leading run of nav items) and footer (from "Speak To Us" onwards)
  let start = 0;
  while (start < links.length && HEADER_TEXTS.has(links[start].text) && /aliveluxuryretreats\.com|wa\.me/.test(links[start].href)) start++;
  let end = links.length;
  const foot = links.map((l) => l.text).lastIndexOf('Speak To Us');
  if (foot > start) end = foot;
  return links.slice(start, end).map((l) => ({ ...l, href: normHref(l.href) }));
}

function parseCapture(md) {
  const route = (md.match(/^# Content capture: `([^`]+)`/m) || [])[1];
  const body = (md.split('## Page content in original DOM order')[1] || '').split('## Links on page')[0];
  const sections = [];
  let cur = null;
  for (let raw of body.split('\n')) {
    if (raw.startsWith('Legend:')) continue;
    const sec = raw.match(/^---- section `([^`]*)`/);
    if (sec) { cur = { id: sec[1], blocks: [] }; sections.push(cur); continue; }
    const line = clean(raw);
    if (!line) continue;
    if (!cur) { cur = { id: 'pre', blocks: [] }; sections.push(cur); }
    let m;
    if ((m = line.match(/^(#{1,6}) (.*)$/))) cur.blocks.push({ t: 'h', level: m[1].length, text: clean(m[2]) });
    else if ((m = line.match(/^- (.*)$/))) cur.blocks.push({ t: 'li', text: clean(m[1]) });
    else if ((m = line.match(/^\[btn\] (.*)$/))) cur.blocks.push({ t: 'btn', text: clean(m[1]) });
    else if ((m = line.match(/^\[link\] (.*)$/))) cur.blocks.push({ t: 'link', text: clean(m[1]) });
    else if ((m = line.match(/^\[label\] (.*)$/))) cur.blocks.push({ t: 'label', text: clean(m[1]) });
    else if ((m = line.match(/^\[field\] \[input (\w+)\].*?aria=(?:'([^']*)'|None)/))) cur.blocks.push({ t: 'field', type: m[1], aria: m[2] || null });
    else if (line === '|') continue;
    else if (/^[•·]s*/.test(line)) {
      // "• a • b" lines are lists in the source
      for (const item of line.split(/s*[•·]s*/).map(clean).filter(Boolean)) cur.blocks.push({ t: 'li', text: item });
    }
    else cur.blocks.push({ t: 'p', text: line.replace(/^[—–-]+/, '').trim() });
  }
  return { route, sections: sections.filter((s) => s.blocks.length) };
}

// Resolve [link] blocks against the page's link table, in order.
function resolveLinks(sections, links, route) {
  const used = new Array(links.length).fill(false);
  const find = (text) => {
    const t = text.slice(0, 80).toLowerCase();
    for (let i = 0; i < links.length; i++) {
      if (used[i]) continue;
      const lt = links[i].text.toLowerCase();
      if (lt && (lt === t || (t.startsWith(lt) && lt.length >= 30))) { used[i] = true; return links[i]; }
    }
    for (let i = 0; i < links.length; i++) { // allow reuse of identical labels
      if (links[i].text.toLowerCase() === t) return links[i];
    }
    return null;
  };
  for (const s of sections) for (const b of s.blocks) {
    if (b.t === 'link') { const l = find(b.text); b.href = l ? l.href : null; if (l && l.target === '_blank') b.newTab = true; }
  }
  // Inline text links: unconsumed rows whose text appears verbatim inside a paragraph / list item.
  // inline links pointing at the page they sit on are dropped (the text stays)
  const inline = links.filter((l, i) => !used[i] && l.text && l.text.length > 3 && l.href && l.href !== route && !/^(1|2|3|See All|Book Now)$/.test(l.text));
  for (const s of sections) for (const b of s.blocks) {
    if (b.t !== 'p' && b.t !== 'li' && b.t !== 'h') continue;
    for (const l of inline) {
      if (l._done) continue;
      const idx = b.text.indexOf(l.text);
      if (idx >= 0 && l.text.length < b.text.length) {
        (b.links ||= []).push({ text: l.text, href: l.href, newTab: l.target === '_blank' });
        l._done = true;
      }
    }
  }
}

function placeImages(route, sections) {
  const imgs = assetMap[route] || [];
  const ids = new Set(sections.map((s) => s.id));
  const extra = [];
  for (const im of imgs) {
    let sec = sections.find((s) => im.ids.includes(s.id));
    const underKey = im.under ? im.under.slice(0, 40).toLowerCase() : null;
    const matchIdx = (s) => underKey ? s.blocks.findIndex((b) => b.t === 'h' && b.text.toLowerCase().startsWith(underKey)) : -1;
    if (!sec && underKey) {
      // fall back to the section that contains the "under" heading (or the next section after it)
      for (let i = 0; i < sections.length; i++) if (matchIdx(sections[i]) >= 0) { sec = sections[i]; break; }
      if (!sec) for (let i = 0; i < sections.length; i++) if (sections[i].blocks.some((b) => b.text && b.text.toLowerCase().startsWith(underKey))) { sec = sections[i]; break; }
    }
    const block = { t: 'img', file: im.file, alt: im.alt.replace(/\.(webp|jpe?g|png)$/i, '') };
    if (!sec) { extra.push({ ...block, under: im.under, ids: im.ids }); continue; }
    let at = matchIdx(sec);
    if (at < 0 && underKey) at = sec.blocks.findIndex((b) => b.text && b.text.toLowerCase().startsWith(underKey));
    // keep all images of the same anchor together, after the anchor
    let pos = at + 1;
    while (pos < sec.blocks.length && sec.blocks[pos].t === 'img') pos++;
    sec.blocks.splice(at < 0 ? countLeadingImgs(sec) : pos, 0, block);
  }
  return extra;
}
const countLeadingImgs = (s) => { let i = 0; while (i < s.blocks.length && s.blocks[i].t === 'img') i++; return i; };

function fileFromUrl(url) {
  if (!url) return null;
  const m = decodeURIComponent(url).match(/media\/([^/]+?\.(?:webp|jpe?g|png|avif))/i);
  return m ? m[1] : null;
}

// ---------- copy corrections (UI/UX audit, docs/UI-UX-AUDIT.html) ----------
const COPY_FIXES = [
  ['three tailored levels', 'two tailored levels'], // only two accommodation levels exist and are shown
  ['Level of Luxury & personalisation', 'Level of Luxury & Personalisation'],
  ['what types of anxiety issues does alive help me recover from?', 'What Types of Anxiety Issues Does Alive Help Me Recover From?'],
  ['DOWNLOAD RETREAT PACKAGES & PRICING', 'Download Retreat Packages & Pricing'],
  ['What is the food like at the alive health spa?', 'What is the food like at the Alive health spa?'],
  // FAQ: a pasted link-preview card ("www…Download Packages | …") trailed the PDF link text
  [/\(PDF\):www\.aliveluxuryretreats\.comDownload Packages \| Alive Luxury Wellness Retreats.*$/, '(PDF)'],
];
// Spain is in Marbella: these inclusions were copied from the Bali page
const ROUTE_FIXES = {
  '/spain-europe': [
    ['Traditional Balinese welcome and blessing ceremony', 'Traditional welcome and blessing ceremony'],
    ['including Balinese healing, reiki', 'including energy healing, reiki'],
  ],
  // Mexico: copy reused from the Bali page
  '/mexico-wellness-retreat': [
    ['only experience in bali at our luxury retreat', 'only experience in Mexico at our luxury retreat'],
    ['made with Bali’s freshest produce', 'made with Mexico’s freshest produce'],
  ],
};
const fixText = (t, route) => [...COPY_FIXES, ...(ROUTE_FIXES[route] || [])].reduce((acc, [a, b]) => acc.replace(a, b), t);
function fixSections(route, sections) {
  for (const sec of sections) for (const b of sec.blocks) if (typeof b.text === 'string') b.text = fixText(b.text, route);
  // Spain food section: its question heading was captured after the list it introduces
  for (const sec of sections) {
    const i = sec.blocks.findIndex((b) => b.t === 'h' && b.text === 'What is the food like at the Alive health spa?');
    const p = sec.blocks.findIndex((b) => b.t === 'p');
    if (i > 0 && i === sec.blocks.length - 1 && p >= 0 && p < i) sec.blocks.splice(p, 0, sec.blocks.splice(i, 1)[0]);
  }
}

// ---------- run ----------
const contentDir = path.join(audit, 'content');
const routes = [];
const posts = [];
for (const f of fs.readdirSync(contentDir)) {
  if (!f.endsWith('.md') || f.startsWith('_') || f === 'faq-pricing__all-categories.md') continue;
  const key = f.replace(/\.md$/, '');
  const md = fs.readFileSync(path.join(contentDir, f), 'utf8').replace(/\r/g, '');
  const { route, sections } = parseCapture(md);
  if (!route) { console.warn('no route', f); continue; }
  const meta = pagesMeta.find((p) => p.route === route) || {};
  const seo = {};
  for (const k of ['title', 'description', 'canonical', 'robots']) {
    const m = md.match(new RegExp(`- \\*\\*${k}\\*\\*: (.*)`));
    if (m) seo[k] = clean(m[1]);
  }
  const links = parseLinks(md);
  resolveLinks(sections, links, route);
  const extraImages = placeImages(route, sections);
  let jsonld = null;
  const jl = path.join(audit, 'data', 'jsonld', key + '.json');
  if (fs.existsSync(jl)) jsonld = JSON.parse(fs.readFileSync(jl, 'utf8'));
  fixSections(route, sections);
  const page = {
    key, route, status: meta.status || '200',
    title: seo.title || meta.title || null,
    description: seo.description || meta.description || null,
    h1: (meta.h1 || []).map(clean),
    iframes: meta.iframes || [],
    sections, extraImages, jsonld,
  };
  if (route.startsWith('/post/')) {
    const bp = (jsonld || []).find((j) => j['@type'] === 'BlogPosting') || {};
    page.post = {
      author: bp.author?.name || null,
      datePublished: bp.datePublished || null,
      dateModified: bp.dateModified || null,
      headline: bp.headline || null,
      excerpt: bp.description || null,
      cover: fileFromUrl(bp.image?.url),
    };
    posts.push({ route, title: page.h1[0] || page.title, ...page.post });
  }
  fs.writeFileSync(path.join(outDir, 'pages', key + '.json'), JSON.stringify(page, null, 1));
  routes.push({ key, route, title: page.title, h1: page.h1[0] || null, words: meta.word_count || null });
}

// ---------- FAQ (7 categories) ----------
{
  const md = fs.readFileSync(path.join(contentDir, 'faq-pricing__all-categories.md'), 'utf8').replace(/\r/g, '');
  const cats = [];
  let cat = null, q = null;
  for (const raw of md.split('\n').slice(1)) {
    const line = raw.replace(/[​﻿]/g, '');
    let m;
    if ((m = line.match(/^## (.*)$/))) { cat = { name: clean(m[1]).replace(/~$/, ''), items: [] }; cats.push(cat); q = null; continue; }
    if ((m = line.match(/^### (.*)$/))) { q = { q: clean(m[1]), a: [] }; cat.items.push(q); continue; }
    if (q && clean(line)) q.a.push(fixText(clean(line)));
  }
  fs.writeFileSync(path.join(outDir, 'faq.json'), JSON.stringify(cats, null, 1));
  console.log('FAQ', cats.length, 'categories,', cats.reduce((n, c) => n + c.items.length, 0), 'questions');
}

// ---------- image catalogue (file + alt) for fallback matching ----------
{
  const catalogue = {};
  for (const [, list] of Object.entries(assetMap)) for (const im of list) {
    if (/^a9ff3b_/.test(im.file) || !im.alt) continue;
    (catalogue[im.file] ||= new Set()).add(im.alt.replace(/.(webp|jpe?g|png)$/i, '').toLowerCase());
  }
  fs.writeFileSync(path.join(outDir, 'images.json'), JSON.stringify(Object.entries(catalogue).map(([file, alts]) => ({ file, alt: [...alts].join(' | ') })), null, 1));
}

posts.sort((a, b) => String(b.datePublished).localeCompare(String(a.datePublished)));
fs.writeFileSync(path.join(outDir, 'posts.json'), JSON.stringify(posts, null, 1));
routes.sort((a, b) => a.route.localeCompare(b.route));
fs.writeFileSync(path.join(outDir, 'routes.json'), JSON.stringify(routes, null, 1));
fs.writeFileSync(path.join(outDir, 'redirects.json'), JSON.stringify(REDIRECTS, null, 1));
console.log('pages', routes.length, 'posts', posts.length);
