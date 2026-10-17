import { media } from '@/lib/media';
import ImgTag from './ImgTag';

/**
 * Plain <img> with pre-generated WebP srcset (no /_next/image requests).
 * `file` is the original filename from source-assets/images. Server components only: client
 * components use ClientImg so the full image manifest stays out of the browser bundle.
 */
export default function Img({ file, ...props }) {
  return <ImgTag m={media(file)} {...props} />;
}
