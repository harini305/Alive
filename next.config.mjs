import redirectsMap from './src/content/generated/redirects.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel free plan: never route images through /_next/image. Pre-sized WebP files live in /public/media.
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  async redirects() {
    return Object.entries(redirectsMap).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
