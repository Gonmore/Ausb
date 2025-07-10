import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ConditionalHeader } from '@/components/conditional-header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FPRAX - Donde el talento encuentra su camino',
  description: 'Conectando talento, construyendo futuro. Plataforma líder para prácticas profesionales que conecta estudiantes, centros educativos y empresas.',
  keywords: 'prácticas profesionales, empleo, estudiantes, empresas, formación, talento, FPRAX',
  authors: [{ name: 'FPRAX' }],
  creator: 'FPRAX',
  publisher: 'FPRAX',
  openGraph: {
    title: 'FPRAX - Donde el talento encuentra su camino',
    description: 'Conectando talento, construyendo futuro',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FPRAX - Donde el talento encuentra su camino',
    description: 'Conectando talento, construyendo futuro',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/fprax-logo.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/fprax-logo.png',
    shortcut: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0092DB',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} fprax-theme`} style={{ fontFamily: 'var(--fprax-font-primary)' }}>
        <Providers>
          <ConditionalHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
