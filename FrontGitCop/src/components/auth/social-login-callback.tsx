'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'

export function SocialLoginCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const token = searchParams.get('token')
        const userStr = searchParams.get('user')
        const error = searchParams.get('error')

        if (error) {
          console.error('❌ Error en social login:', error)
          router.push('/login?error=social_login_failed')
          return
        }

        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr))
          
          // Guardar token y usuario
          setToken(token)
          setUser(user)
          
          console.log('✅ Social login successful:', { user, token: token.substring(0, 20) + '...' })
          
          // Redirigir al dashboard
          router.push('/dashboard')
        } else {
          console.error('❌ Missing token or user data')
          router.push('/login?error=missing_data')
        }
      } catch (error) {
        console.error('❌ Error processing social login callback:', error)
        router.push('/login?error=callback_error')
      }
    }

    handleCallback()
  }, [searchParams, router, setUser, setToken])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  )
}
