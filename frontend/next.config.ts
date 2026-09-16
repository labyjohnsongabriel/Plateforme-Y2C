// next.config.js
/** @type {import('next').NextConfig} */

const API_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://youthcomputing.mg');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    unoptimized: true, // Désactive l'optimisation pour les images distantes
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;