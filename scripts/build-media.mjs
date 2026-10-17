// Generates web-sized WebP derivatives of the original images in source-assets/images
// (originals stay untouched), and copies video, PDF and font files into /public.
// Output: public/media/<slug>-<width>.webp + public/media/manifest.json
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const src = path.join(root, 'source-assets');
const out = path.join(root, 'public', 'media');
const WIDTHS = [640, 1280, 2000];

export const slugOf = (file) => file.replace(/\.[a-z0-9]+$/i, '').replace(/~/g, '-').replace(/[^a-zA-Z0-9_-]/g, '-');

fs.mkdirSync(out, { recursive: true });
for (const dir of ['video', 'pdf', 'fonts']) {
  const dest = path.join(root, 'public', dir);
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(path.join(src, dir))) {
    if (dir === 'fonts' && !f.startsWith('breathing')) continue; // Gigi & Playlist Script are not used
    if (dir === 'video') continue; // public/video holds 720p web encodes of these 1080p originals (see docs/IMPLEMENTATION-NOTES.md)
    const target = path.join(dest, f);
    if (!fs.existsSync(target)) fs.copyFileSync(path.join(src, dir, f), target);
  }
}

const manifestPath = path.join(out, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const files = fs.readdirSync(path.join(src, 'images')).filter((f) => !f.startsWith('a9ff3b_')); // Wix demo products: never used
let done = 0;
for (const file of files) {
  if (manifest[file]) { done++; continue; }
  const input = path.join(src, 'images', file);
  try {
    const img = sharp(input, { limitInputPixels: false, animated: false }).rotate();
    const meta = await img.metadata();
    const w = meta.width, h = meta.height;
    const slug = slugOf(file);
    const sizes = [];
    for (const target of WIDTHS) {
      const tw = Math.min(target, w);
      if (sizes.some((s) => s.w === tw)) continue;
      const name = `${slug}-${tw}.webp`;
      await sharp(input, { limitInputPixels: false }).rotate().resize({ width: tw, withoutEnlargement: true })
        .webp(tw > 1000 && !meta.hasAlpha ? { quality: 72, effort: 6, smartSubsample: true } : { quality: 80, alphaQuality: 90 }).toFile(path.join(out, name));
      sizes.push({ w: tw, src: `/media/${name}` });
      if (tw === w) break;
    }
    manifest[file] = { w, h, alpha: !!meta.hasAlpha, sizes };
  } catch (e) {
    console.error('FAILED', file, e.message);
  }
  if (++done % 25 === 0) console.log(done, '/', files.length);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));

// small image list for client components (logo, white logo, social icons: see src/lib/site.js)
const CLIENT_FILES = ['45f076_391386b1baea4a2393479050eeba3d1b~mv2.png', '45f076_671c6c50de194fdcabae846ecf5cf8c8~mv2.png', '40898a93cfff4578b1779073137eb1b4.png', 'aebe5b6fd55f471a936c72ff2c8289d7.png', 'fcfebdfae12a44f993a94aeed8e2e66b.png', 'a1fed5f687844a6e8f42e017f71dfcb4.png'];
fs.writeFileSync(path.join(root, 'src', 'lib', 'client-media.json'), JSON.stringify(Object.fromEntries(CLIENT_FILES.map((f) => [f, manifest[f]])), null, 1));
console.log('media done', Object.keys(manifest).length);
