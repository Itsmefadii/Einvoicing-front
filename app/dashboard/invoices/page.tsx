'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
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
  ArrowUpTrayIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface InvoiceItem {
  id: number;
  hsCode: string;
  productDescription: string;
  rate: string;
  uoM: string;
  quantity: string;
  totalValues: string;
  valueSalesExcludingST: string;
  fixedNotifiedValueOrRetailPrice: string;
  salesTaxApplicable: boolean;
  salesTaxWithheldAtSource: string;
  extraTax: string;
  furtherTax: string;
  sroScheduleNo: number;
  fedPayable: string;
  discount: string;
  saleType: string;
  sroItemSerialNo: string;
}

interface Invoice {
  id: number;
  sellerId: number;
  invoiceType: string;
  invoiceDate: string;
  buyerNTNCNIC: string;
  buyerBusinessName: string;
  buyerProvince: string;
  buyerAddress: string;
  buyerRegistrationType: string;
  invoiceRefNo: string;
  scenarioId: number;
  totalAmount: string;
  status: 'pending' | 'valid' | 'invalid' | 'submitted' | 'failed' | 'draft';
  fbrInvoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export default function InvoicesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isUploading, setIsUploading] = useState(false);

  console.log('InvoicesPage rendered - User:', user, 'AuthLoading:', authLoading);

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        
        // Get authorization token from localStorage
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
          console.error('No authorization token found in localStorage');
          setInvoices([]);
          setFilteredInvoices([]);
          setIsLoading(false);
          return;
        }
        
        // Try to fetch from your actual API first
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const response = await fetch(`${apiUrl}/invoice`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setInvoices(data.data);
            setFilteredInvoices(data.data);
          } else {
            console.error('API returned unsuccessful response:', data);
            setInvoices([]);
            setFilteredInvoices([]);
          }
        } else if (response.status === 401) {
          console.error('Unauthorized: Invalid or expired token');
          // Could redirect to login or show error message
          setInvoices([]);
          setFilteredInvoices([]);
        } else {
          console.error('Failed to fetch invoices:', response.status, response.statusText);
          setInvoices([]);
          setFilteredInvoices([]);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        // Fallback to empty array if API fails
        setInvoices([]);
        setFilteredInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceRefNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.buyerBusinessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.buyerNTNCNIC?.includes(searchTerm)
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
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      valid: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      invalid: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon },
      failed: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
      draft: { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if user can create/upload invoices (not admin)
  const canCreateInvoice = user?.roleId !== 1; // Admin has roleId 1
  const canUploadInvoice = user?.roleId !== 1; // Admin has roleId 1
  
  // Check if user is a seller
  const isSeller = user?.sellerId !== null || user?.sellerData !== undefined
  
  console.log('User role:', user?.roleId, 'Can upload:', canUploadInvoice, 'Can create:', canCreateInvoice);

  // Handle posting invoice to FBR
  const handlePostInvoice = async (invoiceId: number) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        alert('No authorization token found. Please login again.');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/invoice/post-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceIds: [invoiceId]
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Invoice posted successfully!');
        // Refresh the invoice list
        window.location.reload();
      } else {
        const errorMessage = data.message || data.error || 'Failed to post invoice';
        alert(`Failed to post invoice: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error posting invoice:', error);
      alert('Error posting invoice. Please try again.');
    }
  };

  // Handle Excel file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered!', event.target.files);
    alert('File upload function called!'); // Temporary alert to confirm function is called
    
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      alert('No file selected');
      return;
    }

    console.log('Selected file:', file.name, file.type, file.size);
    alert(`File selected: ${file.name}`);

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    try {
      console.log('Starting upload process...');
      setIsUploading(true);
      
      // Get authorization token from localStorage
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      console.log('Token found:', !!token);
      
      if (!token) {
        alert('No authorization token found. Please login again.');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      console.log('FormData prepared');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      console.log('Calling API:', `${apiUrl}/invoice/upload-excel`);
      
      const response = await fetch(`${apiUrl}/invoice/upload-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (response.ok && data.success) {
        // Success - show success message and refresh
        alert('Excel file uploaded successfully!');
        // Refresh the invoice list
        window.location.reload();
      } else {
        // Failure - show error message with reason
        const errorMessage = data.message || data.error || 'Upload failed';
        alert(`Upload failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  if (isLoading || authLoading) {
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
            Manage and track all your invoices across all sellers.
          </p>
        </div>
        {canCreateInvoice || canUploadInvoice ? (
          <div className="mt-4 sm:mt-0 space-x-3">
            {canUploadInvoice && (
              <div className="inline-block">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    console.log('File input onChange triggered!', e.target.files);
                    handleFileUpload(e);
                  }}
                  disabled={isUploading}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => console.log('Upload button clicked')}
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Excel'}
                </label>
              </div>
            )}
            {canCreateInvoice && (
              <Link
                href="/dashboard/invoices/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Invoice
              </Link>
            )}
          </div>
        ) : null}
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
              <option value="pending">Pending</option>
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
              <option value="submitted">Submitted</option>
              <option value="failed">Failed</option>
              <option value="draft">Draft</option>
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
                  Buyer
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
                  FBR Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
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
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceRefNo}</div>
                    <div className="text-sm text-gray-500">{invoice.invoiceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.buyerBusinessName}</div>
                    <div className="text-sm text-gray-500">NTN: {invoice.buyerNTNCNIC}</div>
                    <div className="text-sm text-gray-500">{invoice.buyerProvince}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(invoice.totalAmount)}</div>
                    <div className="text-sm text-gray-500">
                      Items: {invoice.items.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.invoiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.fbrInvoiceNumber || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {invoice.buyerRegistrationType}
                    </div>
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
                      {isSeller && invoice.status !== 'submitted' && (
                        <Link
                          href={`/dashboard/invoices/${invoice.id}/edit`}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      )}
                      {isSeller && (invoice.status === 'valid' || invoice.status === 'pending' || invoice.status === 'invalid') && (
                        <button
                          onClick={() => handlePostInvoice(invoice.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Post to FBR"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
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
