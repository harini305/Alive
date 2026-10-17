// Local QA: crawls every live route in headless Chrome and reports status, console errors,
// failed requests, broken images, horizontal overflow and any /_next/image usage.
// Usage: node scripts/qa.mjs [baseUrl] [--shots=route1,route2] [--widths=390,1440]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const base = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:3100';
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];
const routes = JSON.parse(fs.readFileSync(path.join(root, 'src/content/generated/routes.json'), 'utf8'))
  .map((r) => r.route).filter((r) => !r.startsWith('/blog/tags/'));
const extra = ['/blog/tags/luxury-wellness-retreat', '/australia', '/copy-of-de-stress-retreats', '/product-page/i-m-a-product', '/definitely-not-a-page'];
const only = arg('routes')?.split(',');
const widths = (arg('widths') || '390,1440').split(',').map(Number);
const shots = arg('shots')?.split(',') || [];
const outDir = arg('out') || path.join(root, '.qa');
fs.mkdirSync(outDir, { recursive: true });

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe });
const results = [];
for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1 });
  for (const route of only || [...routes, ...extra]) {
    const page = await ctx.newPage();
    const errors = [];
    const failed = [];
    let nextImage = 0;
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 200)));
    page.on('requestfailed', (r) => { if (!/youtube|google|favicon/.test(r.url())) failed.push(r.url()); });
    page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith(route)) failed.push(`${r.status()} ${r.url()}`); if (r.url().includes('/_next/image')) nextImage++; });
    let status = 0;
    try {
      const res = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 });
      status = res.status();
      // scroll through to trigger lazy images + scroll animations
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, document.documentElement.scrollHeight);
        await new Promise((r) => setTimeout(r, 900));
      });
      const info = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - doc.clientWidth;
        const wide = overflow > 1 ? [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1 && getComputedStyle(el).position !== 'fixed').slice(0, 4).map((el) => el.tagName + '.' + (el.className?.toString?.() || '').slice(0, 50)) : [];
        const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map((i) => i.src);
        const brokenLazy = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
        const hidden = [...document.querySelectorAll('[data-anim], [data-split] .split-inner')].filter((el) => getComputedStyle(el).opacity === '0').length;
        return { overflow, wide, broken: [...new Set([...broken, ...brokenLazy])], h1: document.querySelectorAll('h1').length, title: document.title, hidden, height: doc.scrollHeight };
      });
      if (shots.includes(route) || shots.includes('all')) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        const name = (route === '/' ? 'home' : route.slice(1).replace(/\//g, '__')) + `-${width}.jpg`;
        await page.screenshot({ path: path.join(outDir, name), fullPage: true, type: 'jpeg', quality: 60 });
      }
      results.push({ width, route, status, ...info, errors, failed: [...new Set(failed)], nextImage, final: page.url().replace(base, '') });
    } catch (e) {
      results.push({ width, route, status, errors: [e.message.slice(0, 200)], failed });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(results, null, 1));
for (const r of results) {
  const flags = [];
  if (r.overflow > 1) flags.push(`OVERFLOW ${r.overflow}px ${r.wide?.join(' ')}`);
  if (r.errors?.length) flags.push(`ERR ${r.errors.join(' | ')}`);
  if (r.failed?.length) flags.push(`FAILED ${r.failed.slice(0, 3).join(' ')}`);
  if (r.broken?.length) flags.push(`BROKEN-IMG ${r.broken.length}`);
  if (r.nextImage) flags.push('NEXT-IMAGE');
  if (r.hidden) flags.push(`HIDDEN ${r.hidden}`);
  if (r.h1 !== 1) flags.push(`H1=${r.h1}`);
  console.log(`${r.width} ${r.status} ${r.route}${r.final && r.final !== r.route ? ' -> ' + r.final : ''} ${flags.length ? '⚠ ' + flags.join(' ; ') : 'OK'}`);
}
