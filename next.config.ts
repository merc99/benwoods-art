import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Old Framer URLs. Every /work/<slug> from Framer still exists; /contact moved into About, and the
  // other old pages point at their closest new home.
  async redirects() {
    return [
      { source: '/contact', destination: '/about#contact', permanent: true },
      { source: '/merc', destination: '/work/merc-eats', permanent: true },
      { source: '/motion', destination: '/lab', permanent: true },
      { source: '/web-design', destination: '/work', permanent: true },
      { source: '/more-art', destination: '/work', permanent: true },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 828, 1080, 1440, 1920, 2400],
  },
}

export default nextConfig
