import subset from './client-media.json';
import { fromEntry } from './mediaEntry';

// Client components (header, footer, video) only need a handful of images. They read this small
// list instead of the full manifest, which would otherwise ship every image path to the browser.
// The list is written by scripts/build-media.mjs (CLIENT_FILES).
export const clientMedia = (file) => fromEntry(file && subset[file]);
