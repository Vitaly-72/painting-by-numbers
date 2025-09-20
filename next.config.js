/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['canvas'],
  },
  images: {
    unoptimized: true, // Важно для Vercel!
    domains: [],
  },
  // Увеличиваем лимиты для API routes
  api: {
    responseLimit: '10mb',
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Для работы с canvas на сервере
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig