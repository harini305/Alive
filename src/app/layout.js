import { Cinzel, Barlow } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuickBar from '@/components/QuickBar';
import SmoothScroll from '@/components/SmoothScroll';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { media } from '@/lib/media';
import { ASSETS } from '@/lib/site';

// Display type is only ever set at 400 (h1-h6, .btn, nav).
const cinzel = Cinzel({ subsets: ['latin'], weight: '400', variable: '--font-cinzel', display: 'swap' });
// DIN Next W01 Light (the original body face) is Wix-licensed; Barlow is the closest free DIN-style grotesk.
const barlow = Barlow({ subsets: ['latin'], weight: ['300', '400', '500'], style: 'normal', variable: '--font-barlow', display: 'swap' });
// the header tagline is the only italic: one face, no preload
const barlowItalic = Barlow({ subsets: ['latin'], weight: '500', style: 'italic', variable: '--font-barlow-italic', display: 'swap', preload: false });

const ogLogo = media(ASSETS.logoSmall);

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Luxury Private Retreats | Wellness, Burnout & Mental Health', template: '%s' },
  description: 'Discover Alive’s luxury holistic private one on one retreats. Ultra personalised programs offer a full health reset, detox, burnout and mental health recovery since 2009.',
  applicationName: SITE_NAME,
  icons: { icon: ogLogo?.smallest, apple: ogLogo?.smallest },
  openGraph: { siteName: SITE_NAME, type: 'website', images: ogLogo ? [{ url: ogLogo.largest }] : [] },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf8f1',
  colorScheme: 'light',
};

// Hide animated elements before first paint only when motion is allowed; a failsafe reveals
// everything if the animation runtime has not started within 2.5s.
const motionBoot = `(function(){try{var d=document.documentElement;if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion-ready');setTimeout(function(){if(!window.__aliveMotion)d.classList.remove('motion-ready')},2500)}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${barlow.variable} ${barlowItalic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBoot }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <QuickBar />
        <SmoothScroll />
      </body>
    </html>
  );
}
