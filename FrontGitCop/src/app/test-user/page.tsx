'use client';

import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestUserPage() {
  const { user, isAuthenticated, token } = useAuthStore();

  const handleTestApply = () => {
    console.log('🔥 Test apply button clicked!');
    console.log('👤 Current user:', user);
    console.log('🔐 Is authenticated:', isAuthenticated);
    console.log('🔑 Token:', token ? '✅ Present' : '❌ Missing');
    console.log('🎯 User role:', user?.role);
    
    if (!user) {
      console.log('❌ No user found');
      alert('No user found');
      return;
    }
    
    if (user.role !== 'student') {
      console.log('❌ User is not a student, role:', user.role);
      alert(`User is not a student. Role: ${user.role}`);
      return;
    }
    
    console.log('✅ All validations passed');
    alert('All validations passed! User can apply.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test User State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>User:</strong> {user ? '✅ Present' : '❌ Missing'}
            </div>
            {user && (
              <div className="bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            )}
            <Button onClick={handleTestApply} className="w-full">
              Test Apply Logic
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
