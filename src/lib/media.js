import manifest from '../../public/media/manifest.json';
import { fromEntry } from './mediaEntry';

// Returns responsive sources for an original asset filename (as named in source-assets/images).
export function media(file) {
  return fromEntry(file && manifest[file]);
}

export const hasMedia = (file) => !!(file && manifest[file]);

/** Natural width / height ratio of an asset (null when unknown). */
export function ratio(file) {
  const entry = file && manifest[file];
  return entry && entry.w && entry.h ? entry.w / entry.h : null;
}

/** Frame aspect ratio that follows the photograph, clamped to a range (defaults 4/5 … 16/10). */
export function frameRatio(file, min = 4 / 5, max = 16 / 10, fallback = 4 / 5) {
  const r = ratio(file);
  if (!r) return fallback;
  return Math.min(max, Math.max(min, r));
}

/** Pixel width of the original asset (0 when unknown). */
export const mediaWidth = (file) => (file && manifest[file]?.w) || 0;
