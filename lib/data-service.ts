export interface DashboardData {
  stats: {
    totalInvoices: number;
    totalTenants: number;
    issuedInvoices: number;
    pendingInvoices: number;
    failedInvoices: number;
    totalRevenue: number;
    monthlyGrowth: number;
    fbrSuccessRate: number;
    activeUsers: number;
  };
  monthlyTrends: {
    month: string;
    invoices: number;
    revenue: number;
    fbrSuccess: number;
    newTenants: number;
  }[];
  topTenants: {
    id: string;
    name: string;
    invoices: number;
    revenue: number;
    successRate: number;
    lastActivity: string;
  }[];
  recentActivity: {
    id: string;
    type: 'invoice_created' | 'invoice_issued' | 'fbr_submission' | 'tenant_added' | 'system_alert';
    message: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
    userId?: string;
    tenantId?: string;
  }[];
  fbrStats: {
    totalSubmissions: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
    averageResponseTime: number;
  };
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

class DataService {
  private static instance: DataService;
  private data: DashboardData;

  private constructor() {
    this.data = this.generateMockData();
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private generateMockData(): DashboardData {
    return {
      stats: {
        totalInvoices: 1247,
        totalTenants: 23,
        issuedInvoices: 892,
        pendingInvoices: 156,
        failedInvoices: 45,
        totalRevenue: 1542000,
        monthlyGrowth: 12.5,
        fbrSuccessRate: 95.3,
        activeUsers: 18
      },
      monthlyTrends: [
        { month: 'Jan', invoices: 120, revenue: 180000, fbrSuccess: 95, newTenants: 2 },
        { month: 'Feb', invoices: 135, revenue: 202500, fbrSuccess: 92, newTenants: 3 },
        { month: 'Mar', invoices: 110, revenue: 165000, fbrSuccess: 88, newTenants: 1 },
        { month: 'Apr', invoices: 145, revenue: 217500, fbrSuccess: 96, newTenants: 4 },
        { month: 'May', invoices: 160, revenue: 240000, fbrSuccess: 94, newTenants: 2 },
        { month: 'Jun', invoices: 175, revenue: 262500, fbrSuccess: 97, newTenants: 3 }
      ],
      topTenants: [
        {
          id: '1',
          name: 'ABC Company',
          invoices: 245,
          revenue: 367500,
          successRate: 96,
          lastActivity: '2 minutes ago'
        },
        {
          id: '2',
          name: 'XYZ Trading',
          invoices: 189,
          revenue: 283500,
          successRate: 94,
          lastActivity: '15 minutes ago'
        },
        {
          id: '3',
          name: 'Tech Solutions',
          invoices: 156,
          revenue: 234000,
          successRate: 92,
          lastActivity: '1 hour ago'
        },
        {
          id: '4',
          name: 'Global Imports',
          invoices: 134,
          revenue: 201000,
          successRate: 89,
          lastActivity: '2 hours ago'
        },
        {
          id: '5',
          name: 'Local Retail',
          invoices: 98,
          revenue: 147000,
          successRate: 91,
          lastActivity: '3 hours ago'
        }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'invoice_issued',
          message: 'Invoice INV-2025-0012 issued successfully with IRN FBR-IRN-123456',
          timestamp: '2 minutes ago',
          status: 'success',
          userId: 'user1',
          tenantId: '1'
        },
        {
          id: '2',
          type: 'fbr_submission',
          message: 'FBR submission completed for invoice INV-2025-0011',
          timestamp: '15 minutes ago',
          status: 'success',
          userId: 'user2',
          tenantId: '2'
        },
        {
          id: '3',
          type: 'invoice_created',
          message: 'New invoice INV-2025-0013 created by ABC Company',
          timestamp: '1 hour ago',
          status: 'success',
          userId: 'user1',
          tenantId: '1'
        },
        {
          id: '4',
          type: 'tenant_added',
          message: 'New tenant "XYZ Trading" added to the platform',
          timestamp: '2 hours ago',
          status: 'success',
          userId: 'admin'
        },
        {
          id: '5',
          type: 'fbr_submission',
          message: 'FBR submission failed for invoice INV-2025-0010 - Invalid NTN',
          timestamp: '3 hours ago',
          status: 'error',
          userId: 'user3',
          tenantId: '3'
        },
        {
          id: '6',
          type: 'system_alert',
          message: 'System maintenance scheduled for tomorrow at 2:00 AM',
          timestamp: '4 hours ago',
          status: 'warning',
          userId: 'system'
        }
      ],
      fbrStats: {
        totalSubmissions: 1247,
        successful: 1189,
        failed: 58,
        pending: 12,
        successRate: 95.3,
        averageResponseTime: 2.3
      },
      systemHealth: {
        uptime: 99.8,
        responseTime: 245,
        errorRate: 0.2,
        activeConnections: 156
      }
    };
  }

  async getDashboardData(): Promise<DashboardData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update some dynamic data
    this.updateDynamicData();
    
    return { ...this.data };
  }

  private updateDynamicData(): void {
    // Simulate real-time updates
    const now = new Date();
    const minutes = now.getMinutes();
    
    // Update recent activity with current timestamp
    if (this.data.recentActivity.length > 0) {
      this.data.recentActivity[0].timestamp = `${minutes} minutes ago`;
    }
    
    // Update system health
    this.data.systemHealth.responseTime = 200 + Math.random() * 100;
    this.data.systemHealth.activeConnections = 150 + Math.floor(Math.random() * 20);
  }

  async getReportData(timeRange: string): Promise<any> {
    // Simulate different data based on time range
    const multiplier = timeRange === '7' ? 0.25 : timeRange === '30' ? 1 : timeRange === '90' ? 3 : 12;
    
    return {
      ...this.data,
      stats: {
        ...this.data.stats,
        totalInvoices: Math.floor(this.data.stats.totalInvoices * multiplier),
        totalRevenue: Math.floor(this.data.stats.totalRevenue * multiplier)
      }
    };
  }

  async exportData(format: 'pdf' | 'excel' | 'csv'): Promise<string> {
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const timestamp = new Date().toISOString().split('T')[0];
    return `dashboard-report-${timestamp}.${format}`;
  }
}

export const dataService = DataService.getInstance();
