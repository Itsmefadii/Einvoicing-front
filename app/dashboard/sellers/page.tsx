'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';

interface BusinessNature {
  businessnature: string;
}

interface Industry {
  industryName: string;
}

interface State {
  state: string;
}

interface SellerUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: number;
}

interface Seller {
  id: number;
  sellerCode: string;
  businessName: string;
  ntnCnic: string;
  businessNatureId: number;
  industryId: number;
  address1: string;
  address2: string;
  city: string;
  stateId: number;
  postalCode: string;
  businessPhone: string;
  businessEmail: string;
  fbrSandBoxToken: string;
  fbrProdToken: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: SellerUser[];
  businessNature: BusinessNature;
  industry: Industry;
  state: State;
}


export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch sellers data from API
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get token from localStorage or auth context
        const token = localStorage.getItem('token');
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sellers: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setSellers(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch sellers');
        }
      } catch (err) {
        console.error('Error fetching sellers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch sellers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (businessNature: string) => {
    switch (businessNature) {
      case 'Exporter': return 'bg-purple-100 text-purple-800';
      case 'Importer': return 'bg-blue-100 text-blue-800';
      case 'Distributor': return 'bg-green-100 text-green-800';
      case 'Wholesaler': return 'bg-yellow-100 text-yellow-800';
      case 'Retailer': return 'bg-indigo-100 text-indigo-800';
      case 'Service Provider': return 'bg-pink-100 text-pink-800';
      case 'Manufacturer': return 'bg-orange-100 text-orange-800';
      case 'Other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Sellers</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage seller accounts and their FBR integration settings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/signup"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Seller
          </Link>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sellers</dt>
                  <dd className="text-lg font-medium text-gray-900">{sellers.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sellers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sellers.filter(s => s.isActive).length}
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
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Production</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sellers.filter(s => s.fbrProdToken && s.fbrProdToken !== '11111111111111111111111111111111111111111111111111111').length}
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
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sellers.reduce((total, seller) => total + seller.users.length, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sellers table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Seller List</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Nature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NTN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoices
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{seller.businessName}</div>
                          <div className="text-sm text-gray-500">{seller.businessEmail}</div>
                          <div className="text-sm text-gray-500">Code: {seller.sellerCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(seller.businessNature?.businessnature || 'Other')}`}>
                        {seller.businessNature?.businessnature || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.ntnCnic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.fbrProdToken && seller.fbrProdToken !== '11111111111111111111111111111111111111111111111111111'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {seller.fbrProdToken && seller.fbrProdToken !== '11111111111111111111111111111111111111111111111111111' ? 'Production' : 'Sandbox'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {seller.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {seller.users.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {/* Invoices count not available in API response, showing N/A */}
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(seller.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/dashboard/sellers/${seller.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/sellers/${seller.id}/users`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Users
                        </Link>
                        <Link
                          href={`/dashboard/sellers/${seller.id}/edit`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/sellers/${seller.id}/fbr`}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          FBR
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
