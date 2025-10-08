'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon, 
  CogIcon, 
  BellIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  UsersIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { LogoutButton } from '@/components/auth/logout-button';
import { UserProfile } from '@/components/auth/user-profile';
import { RouteGuard } from '@/lib/route-guard';
import EnvironmentBanner from '@/components/environment-banner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Icon mapping for permission keys
  const iconMap: Record<string, any> = {
    'dashboard': HomeIcon,
    'invoices': DocumentTextIcon,
    'fbr': BuildingOfficeIcon,
    'integration': BuildingOfficeIcon,
    'reports': ChartBarIcon,
    'sellers': UsersIcon,
    'webhooks': BoltIcon,
    'settings': CogIcon,
    'profile': UserCircleIcon,
    'notifications': BellIcon,
    'analytics': ChartPieIcon,
    'documents': ClipboardDocumentListIcon,
    'preferences': Cog6ToothIcon,
  };

  // Generate navigation from user permissions
  const navigation = user?.permissions
    ?.filter(permission => permission.isRender)
    ?.sort((a, b) => a.position - b.position)
    ?.map(permission => {
      // Handle dynamic routes - convert [id] to a static path for navigation
      let href = permission.path;
      if (href.includes('[id]')) {
        // For dynamic routes, use the parent path for navigation
        if (href.includes('/invoices/[id]')) {
          href = '/dashboard/invoices';
        } else if (href.includes('/sellers/[id]/users')) {
          href = '/dashboard/sellers';
        }
      }
      
      return {
        name: permission.label,
        href: href,
        icon: iconMap[permission.key] || HomeIcon, // Fallback to HomeIcon if no mapping found
        isDynamic: permission.path.includes('[id]'), // Flag to identify dynamic routes
        originalPath: permission.path, // Keep original path for reference
      };
    }) || [];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <AuthGuard>
      <RouteGuard>
        <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl border-r border-slate-200">
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">DI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Digital Invoicing</h1>
                <p className="text-xs text-slate-500 font-medium">Enterprise Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                <item.icon
                  className={`mr-4 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive(item.href) ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 bg-white shadow-lg">
          <div className="flex h-20 items-center px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">DI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Digital Invoicing</h1>
                <p className="text-xs text-slate-500 font-medium">Enterprise Platform</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                <item.icon
                  className={`mr-4 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive(item.href) ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Environment Banner */}
        <EnvironmentBanner />
        
        {/* Top navigation bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-200 glass-effect px-6 shadow-sm sm:gap-x-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 hover:text-slate-900 lg:hidden transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-slate-600 to-slate-800 rounded-full"></div>
                <h2 className="text-xl font-semibold gradient-text">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-x-3 lg:gap-x-4">
              {/* Notifications */}
              <button className="relative p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <UserProfile showDetails={false} className="hidden lg:flex" />
              </div>

              {/* Logout */}
              <LogoutButton variant="ghost" size="sm" className="flex items-center gap-x-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200">
                <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                <span className="hidden lg:block">Logout</span>
              </LogoutButton>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
      </RouteGuard>
    </AuthGuard>
  );
}

