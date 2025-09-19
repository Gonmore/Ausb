
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typedRoutes: false,
  images: {
    domains: ['localhost', 'backend'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig

