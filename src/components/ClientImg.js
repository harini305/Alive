import { clientMedia } from '@/lib/clientMedia';
import ImgTag from './ImgTag';

/** Img for client components: reads the small client image list (see lib/clientMedia.js). */
export default function ClientImg({ file, ...props }) {
  return <ImgTag m={clientMedia(file)} {...props} />;
}
