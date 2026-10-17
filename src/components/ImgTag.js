/** The <img> markup for pre-generated WebP sources (no /_next/image requests). */
export default function ImgTag({ m, alt = '', sizes = '100vw', priority = false, className, style, position, ...rest }) {
  if (!m) return null;
  return (
    <img
      src={m.src}
      srcSet={m.srcSet}
      sizes={sizes}
      width={m.width}
      height={m.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
      style={position ? { objectPosition: position, ...style } : style}
      {...rest}
    />
  );
}
