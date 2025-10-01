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

interface BusinessNature {
  id: number;
  businessnature: string;
}

interface Seller {
  id: string;
  name: string;
  ntn: string;
  strn?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessNatureId: number;
  businessNature?: string;
  environment: 'sandbox' | 'production';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  }[];
  _count: {
    invoices: number;
    users: number;
  };
}


export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSellers: Seller[] = [
          {
            id: '1',
            name: 'Tech Solutions',
            ntn: '1234567-8',
            strn: 'STRN-123456',
            businessAddress: '123 Tech Street, Karachi',
            businessPhone: '+92-300-1234567',
            businessEmail: 'info@techsolutions.com',
            businessNatureId: 6, // Service Provider
            businessNature: 'Service Provider',
            environment: 'production',
            isActive: true,
            createdAt: '2025-01-15',
            updatedAt: '2025-08-16',
            users: [
              {
                id: '1',
                email: 'admin@techsolutions.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'admin',
                isActive: true,
              },
              {
                id: '2',
                email: 'user@techsolutions.com',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'user',
                isActive: true,
              },
            ],
            _count: {
              invoices: 1247,
              users: 2,
            },
          },
          {
            id: '2',
            name: 'ABC Trading',
            ntn: '8765432-1',
            strn: 'STRN-654321',
            businessAddress: '456 Trade Avenue, Lahore',
            businessPhone: '+92-300-7654321',
            businessEmail: 'contact@abctrading.com',
            businessNatureId: 5, // Retailer
            businessNature: 'Retailer',
            environment: 'sandbox',
            isActive: true,
            createdAt: '2025-02-20',
            updatedAt: '2025-08-16',
            users: [
              {
                id: '3',
                email: 'admin@abctrading.com',
                firstName: 'Ahmed',
                lastName: 'Khan',
                role: 'admin',
                isActive: true,
              },
            ],
            _count: {
              invoices: 456,
              users: 1,
            },
          },
          {
            id: '3',
            name: 'XYZ Corporation',
            ntn: '1122334-5',
            strn: 'STRN-112233',
            businessAddress: '789 Corporate Plaza, Islamabad',
            businessPhone: '+92-300-1122334',
            businessEmail: 'info@xyzcorp.com',
            businessNatureId: 7, // Manufacture
            businessNature: 'Manufacture',
            environment: 'production',
            isActive: false,
            createdAt: '2025-03-10',
            updatedAt: '2025-08-16',
            users: [
              {
                id: '4',
                email: 'admin@xyzcorp.com',
                firstName: 'Sarah',
                lastName: 'Johnson',
                role: 'admin',
                isActive: false,
              },
            ],
            _count: {
              invoices: 234,
              users: 1,
            },
          },
    ];

    setSellers(mockSellers);
    setIsLoading(false);
  }, []);

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
      case 'Manufacture': return 'bg-orange-100 text-orange-800';
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
                    {sellers.filter(s => s.environment === 'production').length}
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
                    {sellers.reduce((total, seller) => total + seller._count.users, 0)}
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
                          <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                          <div className="text-sm text-gray-500">{seller.businessEmail}</div>
                          <div className="text-sm text-gray-500">ID: {seller.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(seller.businessNature || 'Other')}`}>
                        {seller.businessNature || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.ntn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.environment === 'production' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {seller.environment === 'production' ? 'Production' : 'Sandbox'}
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
                        {seller._count.users}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller._count.invoices.toLocaleString()}
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
