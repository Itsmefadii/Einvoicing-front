'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Route to permission mapping
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/dashboard/invoices': 'invoices',
  '/dashboard/invoices/create': 'invoices_create',
  '/dashboard/invoices/upload': 'invoices_upload',
  '/dashboard/reports': 'reports',
  '/dashboard/profile': 'profile',
  '/dashboard/tenants': 'tenants',
  '/dashboard/sellers': 'sellers',
  '/dashboard/fbr': 'fbr',
  '/dashboard/webhooks': 'webhooks',
  '/dashboard/settings': 'settings',
  '/dashboard/test-unauthorized': 'test_permission', // This permission doesn't exist
};

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !user) return;

    // Check if current route requires permission
    const requiredPermission = ROUTE_PERMISSIONS[pathname];
    
    if (requiredPermission) {
      // Check if user has the required permission
      let hasPermission = user.permissions?.some(
        permission => permission.key === requiredPermission && permission.isRender
      );

      // If user is admin or has super admin role, allow access to all routes
      if (!hasPermission && (user.roleName?.toLowerCase() === 'admin' || user.roleName?.toLowerCase() === 'superadmin')) {
        hasPermission = true;
      }

      if (!hasPermission) {
        // Redirect to dashboard with error message
        router.push('/dashboard?error=access_denied');
        return;
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
