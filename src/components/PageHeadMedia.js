import Img from './Img';

// Original photographs behind the compact page-header banners (title set on the photo).
const HEAD_MEDIA = {
  '/faq-pricing': { file: '45f076_c014631d131e47099da0ed08f3d273ad~mv2.webp', alt: 'Alive beachfront 5 star luxury retreat' },
  '/booking-conditions': { file: '45f076_5355bfedcb554bd687336ac5757e7566~mv2.jpg', alt: 'Luxury private beachfront pool villa at the wellness resort' },
  '/nda': { file: '45f076_61be7b5b256345ce8ae9a470e1a14b8c~mv2.jpg', alt: 'Confidential 5 star beachfront residence' },
  '/privacy-policy': { file: '45f076_27c109bb86c143108a82a86a31832671~mv2.webp', alt: 'Alive 5 Star Luxury Wellness Retreat Bali' },
  '/contact': { file: '45f076_f096e9a80ca246f484adb52e32c837a0~mv2.webp', alt: 'Alive holistic health and wellness team and therapists' },
  '/get-a-quote': { file: '45f076_201075956f064fdcaa3ff23455ceae1e~mv2.webp', alt: 'Luxury detox retreat' },
  '/pdf': { file: '45f076_abe02e11c25641689fa98c538ac898a5~mv2.webp', alt: 'Alive luxury Bali retreat' },
  '/book-online': { file: '45f076_d9cb742208074390b25b43ed7c3d9067~mv2.webp', alt: 'Expert holistic wellness team', position: '50% 30%' },
  '/blog': { file: '45f076_f14dc01b41f04541b62be8418fed755c~mv2.webp', alt: 'Alive luxury private retreat' },
  '/search': { file: '45f076_01ec519ceab54c4eb25f0d763c9565df~mv2.jpg', alt: 'Luxury wellness and mental health retreats' },
};

export default function PageHeadMedia({ route }) {
  const key = Object.keys(HEAD_MEDIA).find((k) => route === k || route.startsWith(k + '/'));
  const m = key && HEAD_MEDIA[key];
  if (!m) return null;
  return (
    <figure className="media page-head-media" data-anim="settle">
      <Img file={m.file} alt={m.alt} priority sizes="(min-width: 1440px) 1360px, 96vw" position={m.position} />
    </figure>
  );
}
