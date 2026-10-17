import fs from 'node:fs';
import path from 'node:path';
import routes from '@/content/generated/routes.json';
import posts from '@/content/generated/posts.json';
import faq from '@/content/generated/faq.json';

const dir = path.join(process.cwd(), 'src', 'content', 'generated', 'pages');
const cache = new Map();

// The 51 live pages from the audit. Excluded: the sample blog tag capture (served by the tag
// route instead) — the 12 /product-page/* 404s were never captured as pages.
export const LIVE_ROUTES = routes.filter((r) => !r.route.startsWith('/blog/tags/'));

export function getPage(key) {
  if (!cache.has(key)) cache.set(key, JSON.parse(fs.readFileSync(path.join(dir, `${key}.json`), 'utf8')));
  return cache.get(key);
}

export function getPageByRoute(route) {
  const r = routes.find((x) => x.route === route);
  return r ? getPage(r.key) : null;
}

export function getPosts() {
  return posts.map((p) => {
    const page = getPageByRoute(p.route);
    return { ...p, tags: postTags(page) };
  });
}

export function postTags(page) {
  const out = [];
  let inTags = false;
  for (const s of page.sections) for (const b of s.blocks) {
    if (b.t === 'p' && b.text === 'Tags:') { inTags = true; continue; }
    if (inTags && b.t === 'li') out.push(b.text);
    else if (inTags && b.t === 'h') inTags = false;
  }
  return out;
}

export const tagSlug = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function getFaq() {
  return faq;
}
