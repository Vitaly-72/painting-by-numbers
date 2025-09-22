/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // УДАЛИТЬ experimental.appDir - он не нужен в Next.js 14!
  // App Router теперь включен по умолчанию
}

module.exports = nextConfig
