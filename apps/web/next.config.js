/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence Turbopack/webpack config warning
  turbopack: {},
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Force webpack dev mode with source maps
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Force development mode
        config.mode = 'development';
        config.devtool = 'eval-source-map';
        config.optimization = {
          ...config.optimization,
          minimize: false,
          minimizer: [],
          concatenateModules: false,
          usedExports: false,
          sideEffects: false,
        };
        // Disable any production optimizations
        config.output = {
          ...config.output,
          pathinfo: true,
        };
      }
      return config;
    },
    // Disable all minification
    swcMinify: false,
    // Enable verbose error reporting
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
    // Force development compiler
    compiler: {
      removeConsole: false,
    },
  }),
  typescript: {
    // Only ignore build errors in production deployments
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "launchpad4success.pro", 
        "*.launchpad4success.pro",
        "*.vercel.app"
      ]
    }
  },
  async rewrites() {
    return [
      // Preserve API routes on subdomains
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // Preserve Next.js assets on subdomains
      {
        source: '/_next/:path*',
        destination: '/_next/:path*',
      },
      // Handle subdomain routing
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\.launchpad4success\.pro',
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
  // Environment-specific optimizations
  compress: process.env.NODE_ENV === 'production',
  poweredByHeader: false,
  generateEtags: process.env.NODE_ENV === 'production',
  // Development logging
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: process.env.NODE_ENV === 'development' ? 0 : 60,
  }
}

module.exports = nextConfig
