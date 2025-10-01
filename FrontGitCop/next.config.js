/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 OPTIMIZACIONES DE PRODUCCIÓN
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // 📦 CONFIGURACIÓN DE OUTPUT
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // 🖼️ OPTIMIZACIÓN DE IMÁGENES
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },

  // ⚡ CONFIGURACIÓN DE PERFORMANCE
  poweredByHeader: false, // Remover header X-Powered-By

  // 🔒 HEADERS DE SEGURIDAD
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  //  VARIABLES DE ENTORNO - REMOVER PARA USAR .env.local
  // env: {
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  // },

  // 🎯 WEBPACK OPTIMIZATIONS
  webpack: (config, { dev, isServer }) => {
    // Solo en producción
    if (!dev) {
      // Optimizar bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true
            }
          }
        }
      };
    }

    return config;
  },

  // 🏭 CONFIGURACIÓN ESPECÍFICA POR ENTORNO
  ...(process.env.NODE_ENV === 'production' && {
    // Solo en producción
    eslint: {
      ignoreDuringBuilds: true // Ignorar ESLint en build de producción
    },
    typescript: {
      ignoreBuildErrors: false // Mantener verificación de tipos
    },
    // Comprimir respuestas
    compress: true,
  })
};

module.exports = nextConfig;
