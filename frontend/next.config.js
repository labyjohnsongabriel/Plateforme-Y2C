// next.config.js
/** @type {import('next').NextConfig} */

// ✅ URL du backend : priorité à la variable d'environnement, fallback sur localhost ou domaine
const API_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://youthcomputing.mg');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    unoptimized: true, // Désactive l'optimisation d'images (car elles viennent du backend)
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
      // ✅ Redirige /uploads/* vers le backend (images téléchargées)
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
      // ✅ Redirige /api/* vers le backend (appels API)
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;