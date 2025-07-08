'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();

  useEffect(() => {
    console.log('🔧 Auth initializer starting...');
    console.log('🎯 Current token:', token ? '✅ Present' : '❌ Missing');
    console.log('👤 Current user:', user ? '✅ Present' : '❌ Missing');
    
    try {
      // Simple validation - just check if we have both token and user
      if (token && user) {
        console.log('✅ Token and user found, user is authenticated');
      } else {
        console.log('❌ No valid token/user found');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
    }
    
    console.log('🔧 Auth initializer completed');
  }, [token, user]);

  return <>{children}</>;
}
