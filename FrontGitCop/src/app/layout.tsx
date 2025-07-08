import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ConditionalHeader } from '@/components/conditional-header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ausbildung - Plataforma de Prácticas Profesionales',
  description: 'Conectamos estudiantes, centros educativos y empresas para facilitar las prácticas profesionales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <ConditionalHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
