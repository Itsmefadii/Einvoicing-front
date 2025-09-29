'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ArrowPathIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface FbrStatus {
  tenantId: string;
  tenantName: string;
  environment: 'sandbox' | 'production';
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastConnected: string;
  tokenStatus: 'valid' | 'expired' | 'missing';
  tokenExpiresAt?: string;
  lastSubmission: string;
  successRate: number;
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
}

export default function FbrIntegrationPage() {
  const [fbrStatuses, setFbrStatuses] = useState<FbrStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockFbrStatuses: FbrStatus[] = [
      {
        tenantId: '1',
        tenantName: 'Tech Solutions',
        environment: 'production',
        connectionStatus: 'connected',
        lastConnected: '2025-08-16T10:30:00Z',
        tokenStatus: 'valid',
        tokenExpiresAt: '2025-08-16T11:30:00Z',
        lastSubmission: '2025-08-16T10:25:00Z',
        successRate: 98.5,
        totalSubmissions: 1247,
        successfulSubmissions: 1228,
        failedSubmissions: 19,
      },
      {
        tenantId: '2',
        tenantName: 'ABC Trading',
        environment: 'sandbox',
        connectionStatus: 'connected',
        lastConnected: '2025-08-16T09:45:00Z',
        tokenStatus: 'valid',
        tokenExpiresAt: '2025-08-16T10:45:00Z',
        lastSubmission: '2025-08-16T09:40:00Z',
        successRate: 95.2,
        totalSubmissions: 456,
        successfulSubmissions: 434,
        failedSubmissions: 22,
      },
      {
        tenantId: '3',
        tenantName: 'XYZ Corporation',
        environment: 'production',
        connectionStatus: 'error',
        lastConnected: '2025-08-16T08:15:00Z',
        tokenStatus: 'expired',
        lastSubmission: '2025-08-16T08:10:00Z',
        successRate: 87.3,
        totalSubmissions: 234,
        successfulSubmissions: 204,
        failedSubmissions: 30,
      },
    ];

    setFbrStatuses(mockFbrStatuses);
    setIsLoading(false);
  }, []);

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTokenStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'missing':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConnectionStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { color: 'bg-green-100 text-green-800', label: 'Connected' },
      disconnected: { color: 'bg-yellow-100 text-yellow-800', label: 'Disconnected' },
      error: { color: 'bg-red-100 text-red-800', label: 'Error' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTokenStatusBadge = (status: string) => {
    const statusConfig = {
      valid: { color: 'bg-green-100 text-green-800', label: 'Valid' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expired' },
      missing: { color: 'bg-yellow-100 text-yellow-800', label: 'Missing' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.missing;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefreshToken = async (tenantId: string) => {
    setRefreshing(tenantId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(null);
    
    // Update the status
    setFbrStatuses(prev => prev.map(status => 
      status.tenantId === tenantId 
        ? { ...status, tokenStatus: 'valid', connectionStatus: 'connected' }
        : status
    ));
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
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FBR Integration</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and manage FBR integration status across all tenants.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tenants</dt>
                  <dd className="text-lg font-medium text-gray-900">{fbrStatuses.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Connected</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fbrStatuses.filter(s => s.connectionStatus === 'connected').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round(fbrStatuses.reduce((sum, s) => sum + s.successRate, 0) / fbrStatuses.length)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fbrStatuses.reduce((sum, s) => sum + s.totalSubmissions, 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FBR Status Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tenant FBR Status</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fbrStatuses.map((status) => (
                  <tr key={status.tenantId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{status.tenantName}</div>
                          <div className="text-sm text-gray-500">ID: {status.tenantId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status.environment === 'production' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status.environment === 'production' ? 'Production' : 'Sandbox'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getConnectionStatusIcon(status.connectionStatus)}
                        <div className="ml-2">
                          {getConnectionStatusBadge(status.connectionStatus)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Last: {formatDate(status.lastConnected)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTokenStatusIcon(status.tokenStatus)}
                        <div className="ml-2">
                          {getTokenStatusBadge(status.tokenStatus)}
                        </div>
                      </div>
                      {status.tokenExpiresAt && (
                        <div className="text-sm text-gray-500 mt-1">
                          Expires: {formatDate(status.tokenExpiresAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(status.lastSubmission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{status.successRate}%</div>
                        <div className="ml-2 text-sm text-gray-500">
                          ({status.successfulSubmissions}/{status.totalSubmissions})
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status.successRate >= 95 ? 'bg-green-600' :
                              status.successRate >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${status.successRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRefreshToken(status.tenantId)}
                          disabled={refreshing === status.tenantId}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {refreshing === status.tenantId ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                          ) : (
                            <ArrowPathIcon className="h-3 w-3 mr-1" />
                          )}
                          Refresh Token
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                          <KeyIcon className="h-3 w-3 mr-1" />
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Integration Health */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Integration Health</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {fbrStatuses.filter(s => s.connectionStatus === 'connected').length}
              </div>
              <div className="text-sm text-gray-500">Active Connections</div>
              <div className="mt-2">
                <div className="bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(fbrStatuses.filter(s => s.connectionStatus === 'connected').length / fbrStatuses.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {fbrStatuses.filter(s => s.tokenStatus === 'valid').length}
              </div>
              <div className="text-sm text-gray-500">Valid Tokens</div>
              <div className="mt-2">
                <div className="bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(fbrStatuses.filter(s => s.tokenStatus === 'valid').length / fbrStatuses.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(fbrStatuses.reduce((sum, s) => sum + s.successRate, 0) / fbrStatuses.length)}%
              </div>
              <div className="text-sm text-gray-500">Overall Success Rate</div>
              <div className="mt-2">
                <div className="bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${fbrStatuses.reduce((sum, s) => sum + s.successRate, 0) / fbrStatuses.length}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
