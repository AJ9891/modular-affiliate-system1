/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Temporarily ignore build errors during deployment
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "launchpad4success.pro", 
        "*.launchpad4success.com",
        "*.vercel.app"
      ]
    }
  },
  async rewrites() {
    return [
      // Handle subdomain routing
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\.launchpad4success\.com',
          },
        ],
        destination: '/subdomain/:subdomain/:path*',
      },
    ]
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  }
}

module.exports = nextConfig
