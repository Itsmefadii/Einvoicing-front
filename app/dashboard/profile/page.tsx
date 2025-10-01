'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

interface SellerData {
  id: number;
  sellerCode: string;
  businessName: string;
  ntnCnic: string;
  businessNatureId: number;
  businessNatureName: string;
  industryId: number;
  industryName: string;
  address1: string;
  address2: string;
  city: string;
  stateId: number;
  state: string;
  postalCode: string;
  businessPhone: string;
  businessEmail: string;
  fbrSandBoxToken: string;
  fbrProdToken: string;
  logoUrl: string | null;
  isActive: boolean;
}

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  roleId: number;
  roleName: string;
  sellerId: number | null;
  sellerData?: SellerData;
  permissions: any[];
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const isAdmin = authUser?.roleId === 1;
  const showSellerSection = !isAdmin && authUser?.sellerData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Page header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your personal and business information
            </p>
          </div>
        </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserIcon className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Your personal account details and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900">{authUser.fullName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{authUser.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900">{authUser.roleName}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Profile Section - Only show if user is not admin and has seller data */}
      {showSellerSection && authUser.sellerData && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Your business details and FBR configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Name</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.businessName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IdentificationIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">NTN/CNIC</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.ntnCnic}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Seller Code</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.sellerCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Email</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.businessEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Phone</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.businessPhone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address Line 1</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.address1}</p>
                    </div>
                  </div>
                  {authUser.sellerData.address2 && (
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address Line 2</p>
                        <p className="text-sm text-gray-900">{authUser.sellerData.address2}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <BuildingOffice2Icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">City</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">State</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Postal Code</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.postalCode}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Business Details */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Business Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Industry</p>
                    <p className="text-sm text-gray-900">{authUser.sellerData.industryName}</p>
                  </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Nature</p>
                      <p className="text-sm text-gray-900">{authUser.sellerData.businessNature}</p>
                    </div>
                </div>
              </div>
              
              {/* FBR Configuration */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">FBR Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sandbox Token</p>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                      {authUser.sellerData.fbrSandBoxToken}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Production Token</p>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                      {authUser.sellerData.fbrProdToken}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Status Information</h4>
                <div className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full ${authUser.sellerData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Status</p>
                    <p className="text-sm text-gray-900">{authUser.sellerData.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Notice */}
      {isAdmin && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Administrator Account</p>
                <p className="text-sm text-blue-700">
                  As an administrator, you have access to all system features. 
                  Business information is not displayed as you manage multiple tenants.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
