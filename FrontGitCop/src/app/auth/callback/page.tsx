'use client'

import { Suspense } from 'react'
import { SocialLoginCallback } from '@/components/auth/social-login-callback'

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <SocialLoginCallback />
    </Suspense>
  )
}
