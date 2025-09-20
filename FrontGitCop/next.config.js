/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    output: 'standalone',
    typedRoutes: false,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
