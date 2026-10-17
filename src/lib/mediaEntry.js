// Responsive sources for one manifest entry (shared by the full and the client-side image lists).
export function fromEntry(entry) {
  if (!entry) return null;
  const sizes = entry.sizes;
  const mid = sizes.find((s) => s.w >= 1280) || sizes[sizes.length - 1];
  return {
    src: mid.src,
    srcSet: sizes.map((s) => `${s.src} ${s.w}w`).join(', '),
    width: entry.w,
    height: entry.h,
    largest: sizes[sizes.length - 1].src,
    smallest: sizes[0].src,
    alpha: entry.alpha,
  };
}
