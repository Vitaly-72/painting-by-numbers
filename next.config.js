/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Добавьте эту настройку:
  distDir: '.next',
  // Явно укажите директорию с app
  experimental: {
    appDir: true,
  },
  // Укажите корневую директорию
  basePath: '',
  // Для монорепозиториев, но может помочь
  reactStrictMode: true,
}

module.exports = nextConfig
