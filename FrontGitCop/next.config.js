/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
