'use client';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, token, isAuthenticated, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleGoToDashboard = () => {
    console.log('🏠 Navigating to dashboard...');
    router.push('/dashboard');
  };

  const handleGoToLogin = () => {
    console.log('🔐 Navigating to login...');
    router.push('/login');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Auth Status Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>User:</strong> {user ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Loading:</strong> {isLoading ? '🔄 Yes' : '❌ No'}
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 p-2 bg-red-50 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {user && (
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">User Data:</h3>
              <pre className="text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          {token && (
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Token:</h3>
              <p className="text-sm font-mono break-all">
                {token.substring(0, 50)}...
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
            <Button onClick={handleGoToLogin} variant="outline">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
