'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'next/navigation'

interface FacebookLoginButtonProps {
  className?: string
}

export function FacebookLoginButton({ className }: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    
    try {
      // Por ahora, redirigir a la URL del backend
      // En una implementación completa, usaríamos Facebook SDK
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/facebook`
    } catch (error) {
      console.error('Error en Facebook Login:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
      ) : (
        <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      {isLoading ? 'Conectando...' : 'Facebook'}
    </Button>
  )
}
