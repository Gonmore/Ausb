'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import DashboardFactory from '@/components/dashboard-factory';
import RoleSelector from '@/components/role-selector';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent } from '@/components/ui/card';
import { UserRole } from '@/types';

function DashboardContent() {
  const { user, activeRole, getAvailableRoles } = useAuthStore();
  const availableRoles = getAvailableRoles();
  const currentRole = activeRole || user?.role || 'student';

  return (
    <div className="min-h-screen bg-gray-50 fprax-fade-in">
      <div className="container mx-auto px-4 py-8">
        {/* Selector de rol si hay múltiples roles */}
        {availableRoles.length > 1 && (
          <Card className="mb-8 fprax-card">
            <CardContent className="p-6">
              <RoleSelector showCurrent={false} />
            </CardContent>
          </Card>
        )}
        
        {/* Dashboard específico del rol */}
        <DashboardFactory role={(currentRole as UserRole) || 'student'} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth>
      <DashboardContent />
    </AuthGuard>
  );
}
