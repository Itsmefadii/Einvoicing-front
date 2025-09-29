'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerNtn?: string;
  status: 'draft' | 'pending' | 'processing' | 'issued' | 'failed' | 'cancelled';
  amount: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: string;
  dueDate?: string;
  tenant: {
    name: string;
  };
  fbrResponse?: {
    irn?: string;
    qrCode?: string;
    statusCode: number;
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNo: 'INV-2025-0012',
        customerName: 'ABC Company Ltd',
        customerNtn: '1234567-8',
        status: 'issued',
        amount: 50000,
        taxAmount: 9000,
        totalAmount: 59000,
        invoiceDate: '2025-08-16',
        dueDate: '2025-09-16',
        tenant: { name: 'Tech Solutions' },
        fbrResponse: {
          irn: 'FBR-IRN-123456789',
          qrCode: 'data:image/png;base64,...',
          statusCode: 200,
        },
      },
      {
        id: '2',
        invoiceNo: 'INV-2025-0011',
        customerName: 'XYZ Trading',
        customerNtn: '8765432-1',
        status: 'pending',
        amount: 75000,
        taxAmount: 13500,
        totalAmount: 88500,
        invoiceDate: '2025-08-15',
        dueDate: '2025-09-15',
        tenant: { name: 'Tech Solutions' },
      },
      {
        id: '3',
        invoiceNo: 'INV-2025-0010',
        customerName: 'DEF Industries',
        customerNtn: '1122334-5',
        status: 'failed',
        amount: 30000,
        taxAmount: 5400,
        totalAmount: 35400,
        invoiceDate: '2025-08-14',
        tenant: { name: 'Tech Solutions' },
        fbrResponse: {
          statusCode: 400,
        },
      },
      {
        id: '4',
        invoiceNo: 'INV-2025-0009',
        customerName: 'GHI Corporation',
        customerNtn: '5566778-9',
        status: 'draft',
        amount: 45000,
        taxAmount: 8100,
        totalAmount: 53100,
        invoiceDate: '2025-08-13',
        tenant: { name: 'Tech Solutions' },
      },
      {
        id: '5',
        invoiceNo: 'INV-2025-0008',
        customerName: 'JKL Enterprises',
        customerNtn: '9988776-5',
        status: 'issued',
        amount: 60000,
        taxAmount: 10800,
        totalAmount: 70800,
        invoiceDate: '2025-08-12',
        dueDate: '2025-09-12',
        tenant: { name: 'Tech Solutions' },
        fbrResponse: {
          irn: 'FBR-IRN-987654321',
          qrCode: 'data:image/png;base64,...',
          statusCode: 200,
        },
      },
    ];

    setInvoices(mockInvoices);
    setFilteredInvoices(mockInvoices);
    setIsLoading(false);
  }, []);

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerNtn?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [invoices, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      processing: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      issued: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      failed: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track all your invoices across all tenants.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-3">
          <Link
            href="/dashboard/invoices/upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Upload Excel
          </Link>
          <Link
            href="/dashboard/invoices/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="issued">Issued</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </div>
      </div>

      {/* Invoices table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FBR Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNo}</div>
                    {invoice.dueDate && (
                      <div className="text-sm text-gray-500">
                        Due: {formatDate(invoice.dueDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.customerName}</div>
                    {invoice.customerNtn && (
                      <div className="text-sm text-gray-500">NTN: {invoice.customerNtn}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(invoice.totalAmount)}</div>
                    <div className="text-sm text-gray-500">
                      Tax: {formatCurrency(invoice.taxAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.invoiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.tenant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {invoice.fbrResponse?.irn ? (
                      <div className="text-sm text-green-600">
                        <div>IRN: {invoice.fbrResponse.irn}</div>
                        <div className="text-xs text-gray-500">Success</div>
                      </div>
                    ) : invoice.status === 'failed' ? (
                      <div className="text-sm text-red-600">Failed</div>
                    ) : (
                      <div className="text-sm text-gray-500">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {invoice.status === 'draft' && (
                        <Link
                          href={`/dashboard/invoices/${invoice.id}/edit`}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      )}
                      {invoice.status === 'failed' && (
                        <button
                          className="text-orange-600 hover:text-orange-900 p-1"
                          title="Retry"
                        >
                          <ArrowUpTrayIcon className="h-4 w-4" />
                        </button>
                      )}
                      {invoice.status === 'draft' && (
                        <button
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredInvoices.length)}</span> of{' '}
                  <span className="font-medium">{filteredInvoices.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
