'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLoginPage() {
  const [credentials, setCredentials] = useState({
    email: 'testuser@example.com',
    password: '123456'
  });
  
  const { login, isLoading, error, user } = useAuthStore();

  const handleLogin = async () => {
    console.log('🔐 Attempting login with:', credentials);
    const success = await login(credentials);
    console.log('✅ Login result:', success);
    
    if (success) {
      console.log('👤 User data:', user);
    } else {
      console.log('❌ Login failed:', error);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Email:</label>
            <Input
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <label>Password:</label>
            <Input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          {error && (
            <div className="text-red-600 p-2 bg-red-50 rounded">
              Error: {error}
            </div>
          )}
          
          {user && (
            <div className="text-green-600 p-2 bg-green-50 rounded">
              ✅ Logged in as: {user.username} ({user.email})
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
