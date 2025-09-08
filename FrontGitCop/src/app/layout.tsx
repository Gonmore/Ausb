import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalHeader } from "../components/conditional-header";
import QueryProvider from '../providers/query-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TokenGuard } from '@/components/auth/token-guard';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FPRAX - Plataforma de Prácticas Profesionales",
  description: "Conectamos estudiantes, empresas y centros educativos para facilitar las prácticas profesionales",
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-16x16.png', 
        sizes: '16x16',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: '#0092DB',
  colorScheme: 'light'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="fprax-theme">
      <body className={inter.className}>
        <QueryProvider>
          <TokenGuard>
            <ConditionalHeader />
            <main className="min-h-screen">
              {children}
            </main>
          </TokenGuard>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </QueryProvider>
      </body>
    </html>
  );
}
