'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  DocumentTextIcon, 
  BuildingOfficeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';

// Custom hook for counting animation
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (end === start) return;
    
    setIsAnimating(true);
    const startTime = Date.now();
    const difference = end - start;
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(start + (difference * easeOutQuart));
      
      setCount(currentCount);
      
      if (progress >= 1) {
        setCount(end);
        setIsAnimating(false);
        clearInterval(timer);
      }
    }, 16); // ~60fps
    
    return () => clearInterval(timer);
  }, [end, duration, start]);

  return { count, isAnimating };
}

interface DashboardStats {
  totalInvoices: number;
  totalUsers: number;
  totalRevenue: number;
  successRate: number;
  pendingInvoices: number;
  submittedInvoices: number;
  invalidInvoices: number;
  validInvoices: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice_created' | 'invoice_issued' | 'fbr_submission' | 'seller_added';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const { user } = useAuth();

  // Check if user is a seller
  const isSeller = user?.sellerId !== null || user?.sellerData !== undefined;

  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalUsers: 0,
    totalRevenue: 0,
    successRate: 0,
    pendingInvoices: 0,
    submittedInvoices: 0,
    invalidInvoices: 0,
    validInvoices: 0,
  });

  // Animated counters
  const totalInvoicesCount = useCountUp(stats.totalInvoices, 3500, 0);
  const totalUsersCount = useCountUp(stats.totalUsers, 3500, 0);
  const totalRevenueCount = useCountUp(stats.totalRevenue, 3500, 0);
  const successRateCount = useCountUp(stats.successRate, 3500, 0);
  const pendingInvoicesCount = useCountUp(stats.pendingInvoices, 3500, 0);
  const submittedInvoicesCount = useCountUp(stats.submittedInvoices, 3500, 0);
  const invalidInvoicesCount = useCountUp(stats.invalidInvoices, 3500, 0);
  const validInvoicesCount = useCountUp(stats.validInvoices, 3500, 0);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'invoice_issued',
      message: 'Invoice INV-2025-0012 issued successfully with IRN FBR-IRN-123456',
      timestamp: '2 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'fbr_submission',
      message: 'FBR submission completed for invoice INV-2025-0011',
      timestamp: '15 minutes ago',
      status: 'success',
    },
    {
      id: '3',
      type: 'invoice_created',
      message: 'New invoice INV-2025-0013 created by ABC Company',
      timestamp: '1 hour ago',
      status: 'success',
    },
    {
      id: '4',
      type: 'seller_added',
      message: 'New seller "XYZ Trading" added to the platform',
      timestamp: '2 hours ago',
      status: 'success',
    },
    {
      id: '5',
      type: 'fbr_submission',
      message: 'FBR submission failed for invoice INV-2025-0010 - Invalid NTN',
      timestamp: '3 hours ago',
      status: 'error',
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for access denied error
    if (searchParams.get('error') === 'access_denied') {
      setShowAccessDenied(true);
    }

    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_created':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'invoice_issued':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'fbr_submission':
        return <BuildingOfficeIcon className="h-5 w-5 text-purple-500" />;
      case 'seller_added':
        return <BuildingOfficeIcon className="h-5 w-5 text-indigo-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Access Denied Alert */}
      {showAccessDenied && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You don't have permission to access that page. You've been redirected to the dashboard.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setShowAccessDenied(false)}
                  className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back! Here's what's happening with your digital invoicing platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/invoices/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invoices */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalInvoicesCount.count.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/invoices" className="font-medium text-blue-700 hover:text-blue-900">
                View all invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Total Sellers / Number of Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {isSeller ? (
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                ) : (
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {isSeller ? 'Number of users' : 'Active Sellers'}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isSeller ? totalUsersCount.count : totalUsersCount.count}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/sellers" className="font-medium text-blue-700 hover:text-blue-900">
                {isSeller ? 'View users' : 'Manage sellers'}
              </Link>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalRevenueCount.count)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +12%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {successRateCount.count}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-500">
              {submittedInvoicesCount.count} of {totalInvoicesCount.count} successful
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Status Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Invoice Status Overview</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{submittedInvoicesCount.count}</div>
              <div className="text-sm text-gray-500">Submitted</div>
              <div className="mt-2">
                <div className="bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-1500 ease-out" 
                    style={{ width: `${totalInvoicesCount.count > 0 ? (submittedInvoicesCount.count / totalInvoicesCount.count) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingInvoicesCount.count}</div>
              <div className="text-sm text-gray-500">Pending</div>
              <div className="mt-2">
                <div className="bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-1500 ease-out" 
                    style={{ width: `${totalInvoicesCount.count > 0 ? (pendingInvoicesCount.count / totalInvoicesCount.count) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{invalidInvoicesCount.count}</div>
              <div className="text-sm text-gray-500">Invalid</div>
              <div className="mt-2">
                <div className="bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-1500 ease-out" 
                    style={{ width: `${totalInvoicesCount.count > 0 ? (invalidInvoicesCount.count / totalInvoicesCount.count) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Link
                href="/dashboard/invoices/create"
                className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-center mb-2">
                  <PlusIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-sm font-medium text-gray-900">Create New Invoice</div>
              </Link>
              <Link
                href="/dashboard/invoices/upload"
                className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-center mb-2">
                  <DocumentTextIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-sm font-medium text-gray-900">Upload Excel File</div>
              </Link>
              <Link
                href="/dashboard/sellers"
                className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-center mb-2">
                  <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-sm font-medium text-gray-900">Manage Sellers</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity - Only for Admins */}
        {!isSeller && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        <div className="ml-2">
                          {getStatusIcon(activity.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/audit-logs"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Health - Only for Admins */}
      {!isSeller && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Health</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2.3s</div>
                <div className="text-sm text-gray-500">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-sm text-gray-500">FBR Connection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">Failed Jobs</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
