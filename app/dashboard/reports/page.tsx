'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/lib/auth-context';

// Type definitions for the API response
interface MetricData {
  value: number;
  trend?: string;
  detail?: string;
}

interface MonthlyData {
  month: string;
  invoices: number;
  revenue: number;
}

interface TopPerformerData {
  name: string;
  quantity?: number;
  revenue: number;
  invoices?: number;
  successRate?: number;
}

interface ReportsData {
  totalInvoices: MetricData;
  totalRevenue: MetricData;
  fbrSuccessRate: MetricData;
  activeSellers: MetricData | null;
  monthlyInvoiceVolume: {
    subtitle: string;
    data: MonthlyData[];
  };
  topPerformers: {
    subtitle: string;
    data: TopPerformerData[];
  };
}

interface ReportsResponse {
  success: boolean;
  message: string;
  data: ReportsData;
  timestamp: string;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Track API call to prevent duplicates
  const hasFetchedReports = useRef(false);

  // Check if user is admin (roleId 1) or seller (roleId 2)
  const isAdmin = user?.roleId === 1;
  const isSeller = user?.roleId === 2;

  useEffect(() => {
    // Only fetch when user is available
    if (!user) {
      return;
    }

    // Prevent duplicate API calls
    if (hasFetchedReports.current) {
      console.log('Skipping Reports API call - already fetched');
      return;
    }

    const fetchReportsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        hasFetchedReports.current = true; // Mark as fetched

        // Get authorization token from localStorage
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
          setError('No authorization token found. Please login again.');
          hasFetchedReports.current = false; // Reset on error
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const response = await fetch(`${apiUrl}/invoice/reports`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: ReportsResponse = await response.json();
          if (data.success && data.data) {
            setReportData(data.data);
            console.log('Reports data fetched successfully');
          } else {
            setError(data.message || 'Failed to fetch reports data');
            hasFetchedReports.current = false; // Reset on error
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch reports data');
          hasFetchedReports.current = false; // Reset on error
        }
      } catch (error) {
        console.error('Error fetching reports data:', error);
        setError('Error fetching reports data. Please try again.');
        hasFetchedReports.current = false; // Reset on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-PK').format(num);
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+') || trend.includes('Infinity')) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (trend.includes('-')) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return <ClockIcon className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('+') || trend.includes('Infinity')) {
      return 'text-green-600';
    } else if (trend.includes('-')) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    // Placeholder for export functionality
    alert(`Export ${format.toUpperCase()} functionality will be implemented soon.`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading reports</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load report data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
              <ChartBarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Reports & Analytics</h1>
              <p className="text-slate-500 font-medium">Performance insights and metrics</p>
            </div>
          </div>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            {isAdmin 
              ? 'Comprehensive insights into the digital invoicing platform performance across all sellers.'
              : 'Your personal invoicing performance and analytics dashboard.'
            }
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex gap-3">
          <Button onClick={() => exportReport('pdf')} variant="outline" size="sm" className="btn-professional">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => exportReport('excel')} variant="outline" size="sm" className="btn-professional">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-professional border-0 shadow-professional bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Invoices</CardTitle>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatNumber(reportData.totalInvoices.value)}</div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(reportData.totalInvoices.trend || '')}
              <p className={`text-sm font-medium ${getTrendColor(reportData.totalInvoices.trend || '')}`}>
                {reportData.totalInvoices.trend || 'No trend data'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional border-0 shadow-professional bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Revenue</CardTitle>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(reportData.totalRevenue.value)}</div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(reportData.totalRevenue.trend || '')}
              <p className={`text-sm font-medium ${getTrendColor(reportData.totalRevenue.trend || '')}`}>
                {reportData.totalRevenue.trend || 'No trend data'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional border-0 shadow-professional bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">FBR Success Rate</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 mb-2">{reportData.fbrSuccessRate.value.toFixed(1)}%</div>
            <p className="text-sm text-slate-600 font-medium">
              {reportData.fbrSuccessRate.detail || 'No detail available'}
            </p>
          </CardContent>
        </Card>

        {/* Show Active Sellers only for Admin */}
        {isAdmin && reportData.activeSellers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
              <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.activeSellers.value}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.activeSellers.detail || 'No detail available'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Show a different metric for sellers if needed */}
        {isSeller && !reportData.activeSellers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(reportData.totalInvoices.value)}</div>
              <p className="text-xs text-muted-foreground">
                Invoices processed
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Invoice Volume</CardTitle>
            <CardDescription>{reportData.monthlyInvoiceVolume.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyInvoiceVolume.data.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{data.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(data.invoices)} invoices</div>
                    <div className="text-xs text-gray-500">{formatCurrency(data.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isAdmin ? 'Top Performing Sellers' : 'Top Performing Products'}
            </CardTitle>
            <CardDescription>{reportData.topPerformers.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topPerformers.data.slice(0, 5).map((performer, index) => (
                <div key={performer.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium truncate max-w-[200px]" title={performer.name}>
                        {performer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isAdmin 
                          ? `${formatNumber(performer.invoices || 0)} invoices`
                          : `Qty: ${formatNumber(performer.quantity || 0)}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(performer.revenue)}</div>
                    {isAdmin && performer.successRate !== undefined && (
                      <div className="text-xs text-green-600">{performer.successRate}% success</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Overall platform performance and key insights'
              : 'Your invoicing performance summary and insights'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(reportData.totalInvoices.value)}</div>
              <div className="text-sm text-gray-600">Total Invoices</div>
              <div className="text-xs text-gray-500 mt-1">
                {reportData.totalInvoices.trend || 'No trend data'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalRevenue.value)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-gray-500 mt-1">
                {reportData.totalRevenue.trend || 'No trend data'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{reportData.fbrSuccessRate.value.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">FBR Success Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {reportData.fbrSuccessRate.detail || 'No detail available'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
