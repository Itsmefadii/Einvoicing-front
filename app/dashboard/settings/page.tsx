'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { SuccessModal } from '@/app/components/ui/success-modal';
import { useAuth } from '@/lib/auth-context';
import { LogoutButton } from '@/components/auth/logout-button';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isSeller = user?.roleId === 2; // Assuming roleId 2 is for sellers
  const [activeTab, setActiveTab] = useState(isSeller ? 'environment' : 'profile');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isChangingEnvironment, setIsChangingEnvironment] = useState(false);
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  // Define tabs based on user role
  const allTabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon },
    { id: 'environment', name: 'Environment', icon: CloudIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon }
  ];

  // Filter tabs based on user role
  const tabs = isSeller 
    ? allTabs.filter(tab => ['environment', 'security', 'api'].includes(tab.id))
    : allTabs;

  // Load environment from fbrTokenType in user data
  useEffect(() => {
    // Determine environment based on fbrTokenType from user data
    const userData = user?.sellerData;
    if ((userData as any)?.fbrTokenType) {
      const tokenType = (userData as any).fbrTokenType.toLowerCase();
      if (tokenType === 'production') {
        setEnvironment('production');
      } else if (tokenType === 'sandbox') {
        setEnvironment('sandbox');
      } else {
        // Default to sandbox if fbrTokenType is not recognized
        setEnvironment('sandbox');
      }
    } else {
      // Default to sandbox if no fbrTokenType
      setEnvironment('sandbox');
    }
  }, [user]);

  // Update active tab when user changes
  useEffect(() => {
    if (isSeller) {
      setActiveTab('environment');
    } else {
      setActiveTab('profile');
    }
  }, [isSeller]);

  const handleEnvironmentChange = (newEnvironment: 'sandbox' | 'production') => {
    setSelectedEnvironment(newEnvironment);
    setShowEnvironmentModal(true);
  };

  const confirmEnvironmentChange = async () => {
    setIsChangingEnvironment(true);
    try {
      // Call API to update environment
      const token = localStorage.getItem('token');
      const tokenType = selectedEnvironment === 'production' ? 'Production' : 'Sandbox';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers/environment-change`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenType: tokenType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Update FBR token and fbrTokenType based on selected environment
          const userData = user?.sellerData;
          if (userData) {
            if (selectedEnvironment === 'production' && userData.fbrProdToken) {
              localStorage.setItem('fbrToken', userData.fbrProdToken);
              // Update fbrTokenType in user data
              const updatedUser = { ...user };
              if (updatedUser.sellerData) {
                (updatedUser.sellerData as any).fbrTokenType = 'Production';
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            } else if (selectedEnvironment === 'sandbox' && userData.fbrSandBoxToken) {
              localStorage.setItem('fbrToken', userData.fbrSandBoxToken);
              // Update fbrTokenType in user data
              const updatedUser = { ...user };
              if (updatedUser.sellerData) {
                (updatedUser.sellerData as any).fbrTokenType = 'Sandbox';
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            }
          }
          
          setEnvironment(selectedEnvironment);
          setShowEnvironmentModal(false);
          // Show success modal
          setShowSuccessModal(true);
        } else {
          console.error('API returned unsuccessful response:', data);
          alert(`Failed to change environment: ${data.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json();
        console.error('API call failed:', errorData);
        alert(`Failed to change environment: ${errorData.message || 'Network error'}`);
      }
    } catch (error) {
      console.error('Error changing environment:', error);
      alert('Failed to change environment. Please try again.');
    } finally {
      setIsChangingEnvironment(false);
    }
  };

  const cancelEnvironmentChange = () => {
    setShowEnvironmentModal(false);
    setSelectedEnvironment(environment);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Logout user and redirect to login
    logout();
    router.push('/login');
  };

  // Password validation functions
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!oldPassword.trim()) {
      errors.oldPassword = 'Old password is required';
    }
    
    if (!newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidationErrors = validatePassword(newPassword);
      if (passwordValidationErrors.length > 0) {
        errors.newPassword = passwordValidationErrors.join(', ');
      }
    }
    
    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (oldPassword === newPassword) {
      errors.newPassword = 'New password must be different from old password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordErrors({});
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setShowPasswordSuccess(true);
          // Reset form
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setPasswordErrors({ 
            oldPassword: data.message || 'Failed to change password' 
          });
        }
      } else {
        const errorData = await response.json();
        setPasswordErrors({ 
          oldPassword: errorData.message || 'Failed to change password' 
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({ 
        oldPassword: 'Network error. Please try again.' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordSuccessClose = () => {
    setShowPasswordSuccess(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information and company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <Input defaultValue={user?.sellerData?.businessName || 'Demo Company'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NTN</label>
                <Input defaultValue={user?.sellerData?.ntnCnic || '1234567'} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input type="email" defaultValue={user?.email || 'admin@democompany.com'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                <Input defaultValue={environment} disabled />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Input defaultValue="123 Business Street, Karachi, Pakistan" />
            </div>
            <div className="flex justify-between items-center">
              <LogoutButton variant="destructive">
                Logout
              </LogoutButton>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your application experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="PKR">Pakistani Rupee (PKR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Asia/Karachi">Asia/Karachi (UTC+5)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'environment' && (
        <div className="space-y-6">
          {/* Current Environment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudIcon className="h-5 w-5" />
                <span>Current Environment</span>
              </CardTitle>
              <CardDescription>Your current FBR integration environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    environment === 'production' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{environment} Environment</p>
                    <p className="text-sm text-gray-600">
                      {environment === 'production' 
                        ? 'Live FBR integration - Real invoices will be submitted'
                        : 'Test environment - Safe for testing and development'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {environment === 'production' ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Switch Environment</CardTitle>
              <CardDescription>Choose between sandbox and production environments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sandbox Environment */}
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  environment === 'sandbox' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded-full mt-1 ${
                      environment === 'sandbox' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Sandbox Environment</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Safe testing environment for development and testing purposes.
                      </p>
                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li>• Test invoices without affecting real data</li>
                        <li>• Safe for experimentation</li>
                        <li>• No real FBR submissions</li>
                      </ul>
                      {environment === 'sandbox' && (
                        <div className="mt-2 flex items-center text-green-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Currently Active
                        </div>
                      )}
                    </div>
                  </div>
                  {environment !== 'sandbox' && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => handleEnvironmentChange('sandbox')}
                        variant="outline"
                        className="w-full"
                      >
                        Switch to Sandbox
                      </Button>
                    </div>
                  )}
                </div>

                {/* Production Environment */}
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  environment === 'production' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded-full mt-1 ${
                      environment === 'production' ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Production Environment</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Live environment for real invoice submissions to FBR.
                      </p>
                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li>• Real FBR invoice submissions</li>
                        <li>• Live business transactions</li>
                        <li>• Permanent data changes</li>
                      </ul>
                      {environment === 'production' && (
                        <div className="mt-2 flex items-center text-red-600 text-sm">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Currently Active
                        </div>
                      )}
                    </div>
                  </div>
                  {environment !== 'production' && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => handleEnvironmentChange('production')}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Switch to Production
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning for Production */}
              {environment === 'production' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">Production Environment Active</h4>
                      <p className="text-sm text-red-700 mt-1">
                        You are currently using the production environment. All invoice submissions will be sent to FBR and cannot be undone. 
                        Please ensure you have proper authorization and testing before switching to production.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Details</CardTitle>
              <CardDescription>Technical information about your current environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Environment</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      environment === 'production' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm text-gray-900 capitalize">{environment}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FBR Token Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      user?.sellerData?.fbrSandBoxToken || user?.sellerData?.fbrProdToken ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">
                      {user?.sellerData?.fbrSandBoxToken || user?.sellerData?.fbrProdToken ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  {(user?.sellerData as any)?.fbrTokenType && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        Current Type: {(user?.sellerData as any)?.fbrTokenType}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {environment === 'production' 
                      ? 'https://api.fbr.gov.pk/production' 
                      : 'https://api.fbr.gov.pk/sandbox'
                    }
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                  <span className="text-sm text-gray-900">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {/* Current FBR Token Display */}
              {user?.sellerData && (user.sellerData.fbrSandBoxToken || user.sellerData.fbrProdToken) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Current FBR Token</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {(user.sellerData as any).fbrTokenType || (environment === 'production' ? 'Production Token' : 'Sandbox Token')}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        ((user.sellerData as any).fbrTokenType?.toLowerCase() === 'production' || environment === 'production')
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(user.sellerData as any).fbrTokenType?.toLowerCase() === 'production' || environment === 'production' ? 'LIVE' : 'TEST'}
                      </div>
                    </div>
                    <code className="text-xs text-gray-700 break-all">
                      {environment === 'production' 
                        ? user.sellerData.fbrProdToken 
                        : user.sellerData.fbrSandBoxToken
                      }
                    </code>
                    {(user.sellerData as any).fbrTokenType && (
                      <div className="mt-2 text-xs text-gray-500">
                        Token Type: {(user.sellerData as any).fbrTokenType}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Invoice Status Updates</p>
                  <p className="text-sm text-gray-600">Get notified when invoice status changes</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">FBR Integration Alerts</p>
                  <p className="text-sm text-gray-600">Get notified about FBR integration issues</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Save Notifications</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
              <Input 
                type="password" 
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={passwordErrors.oldPassword ? 'border-red-500' : ''}
              />
              {passwordErrors.oldPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.oldPassword}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <Input 
                type="password" 
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={passwordErrors.newPassword ? 'border-red-500' : ''}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
              )}
              <div className="mt-2 text-xs text-gray-600">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                    At least 8 characters
                  </li>
                  <li className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                    One lowercase letter
                  </li>
                  <li className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                    One uppercase letter
                  </li>
                  <li className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                    One number
                  </li>
                  <li className={/(?=.*[@$!%*?&])/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <Input 
                type="password" 
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isChangingPassword ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Changing Password...</span>
                  </div>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'api' && (
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API keys for third-party integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Production API Key</p>
                  <p className="text-sm text-gray-600">Used for production integrations</p>
                </div>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
              <div className="mt-2">
                <code className="text-sm bg-white px-2 py-1 rounded border">sk_prod_1234567890abcdef...</code>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Sandbox API Key</p>
                  <p className="text-sm text-gray-600">Used for testing and development</p>
                </div>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
              <div className="mt-2">
                <code className="text-sm bg-white px-2 py-1 rounded border">sk_test_1234567890abcdef...</code>
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Create New API Key</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Change Confirmation Modal */}
      {showEnvironmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedEnvironment === 'production' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <CloudIcon className={`h-5 w-5 ${
                  selectedEnvironment === 'production' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Switch to {selectedEnvironment === 'production' ? 'Production' : 'Sandbox'} Environment
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedEnvironment === 'production' 
                    ? 'You are about to switch to the live production environment.'
                    : 'You are about to switch to the sandbox testing environment.'
                  }
                </p>
              </div>
            </div>

            {selectedEnvironment === 'production' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800">Production Environment Warning</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will switch to the live FBR production environment. All invoice submissions will be real and cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                onClick={cancelEnvironmentChange}
                variant="outline"
                disabled={isChangingEnvironment}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmEnvironmentChange}
                disabled={isChangingEnvironment}
                className={selectedEnvironment === 'production' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
                }
              >
                {isChangingEnvironment ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Switching...</span>
                  </div>
                ) : (
                  `Switch to ${selectedEnvironment === 'production' ? 'Production' : 'Sandbox'}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal for Environment Change */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Environment Changed Successfully!"
        message={`Your environment has been successfully changed to ${selectedEnvironment === 'production' ? 'Production' : 'Sandbox'}. You will be logged out and redirected to the login page.`}
        buttonText="Continue"
        onButtonClick={handleSuccessModalClose}
      />

      {/* Success Modal for Password Change */}
      <SuccessModal
        isOpen={showPasswordSuccess}
        onClose={handlePasswordSuccessClose}
        title="Password Changed Successfully!"
        message="Your password has been successfully updated. Please use your new password for future logins."
        buttonText="OK"
        onButtonClick={handlePasswordSuccessClose}
      />
    </div>
  );
}
