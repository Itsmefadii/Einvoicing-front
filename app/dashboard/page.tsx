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
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalInvoices: number;
  totalSellers: number;
  issuedInvoices: number;
  pendingInvoices: number;
  failedInvoices: number;
  totalRevenue: number;
  monthlyGrowth: number;
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

  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 1247,
    totalSellers: 23,
    issuedInvoices: 892,
    pendingInvoices: 156,
    failedInvoices: 45,
    totalRevenue: 1542000,
    monthlyGrowth: 12.5,
  });

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

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
                  <dd className="text-lg font-medium text-gray-900">{stats.totalInvoices.toLocaleString()}</dd>
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

        {/* Total Sellers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sellers</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalSellers}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/sellers" className="font-medium text-blue-700 hover:text-blue-900">
                Manage sellers
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
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {stats.monthlyGrowth}%
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
                    {Math.round((stats.issuedInvoices / stats.totalInvoices) * 100)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-500">
              {stats.issuedInvoices} of {stats.totalInvoices} successful
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
              <div className="text-2xl font-bold text-green-600">{stats.issuedInvoices}</div>
              <div className="text-sm text-gray-500">Issued</div>
              <div className="mt-2">
                <div className="bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(stats.issuedInvoices / stats.totalInvoices) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</div>
              <div className="text-sm text-gray-500">Pending</div>
              <div className="mt-2">
                <div className="bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(stats.pendingInvoices / stats.totalInvoices) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failedInvoices}</div>
              <div className="text-sm text-gray-500">Failed</div>
              <div className="mt-2">
                <div className="bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(stats.failedInvoices / stats.totalInvoices) * 100}%` }}
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
            <div className="space-y-3">
              <Link
                href="/dashboard/invoices/create"
                className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <PlusIcon className="h-5 w-5 text-blue-500 mr-3" />
                Create New Invoice
              </Link>
              <Link
                href="/dashboard/invoices/upload"
                className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <DocumentTextIcon className="h-5 w-5 text-green-500 mr-3" />
                Upload Excel File
              </Link>
              <Link
                href="/dashboard/sellers"
                className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <BuildingOfficeIcon className="h-5 w-5 text-purple-500 mr-3" />
                Manage Sellers
              </Link>
              <Link
                href="/dashboard/fbr"
                className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <BuildingOfficeIcon className="h-5 w-5 text-indigo-500 mr-3" />
                FBR Integration Status
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
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
      </div>

      {/* System Health */}
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
    </div>
  );
}
