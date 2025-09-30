'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  UserIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { dataService } from '@/lib/data-service';

interface BusinessNature {
  id: number;
  businessnature: string;
}

interface SignupFormData {
  // Tenant Information
  tenantName: string;
  ntn: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessNatureId: number;
  
  // User Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // FBR Configuration
  fbrSandboxClientId: string;
  fbrProductionClientId: string;
}


export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [businessNatures, setBusinessNatures] = useState<BusinessNature[]>([]);
  const [loadingBusinessNatures, setLoadingBusinessNatures] = useState(true);

  const [formData, setFormData] = useState<SignupFormData>({
    tenantName: '',
    ntn: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessNatureId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fbrSandboxClientId: '',
    fbrProductionClientId: '',
  });

  // Fetch business natures on component mount
  useEffect(() => {
    const fetchBusinessNatures = async () => {
      try {
        setLoadingBusinessNatures(true);
        const natures = await dataService.getBusinessNatures();
        setBusinessNatures(natures);
        // Set default selection to first item
        if (natures.length > 0) {
          setFormData(prev => ({ ...prev, businessNatureId: natures[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch business natures:', error);
      } finally {
        setLoadingBusinessNatures(false);
      }
    };

    fetchBusinessNatures();
  }, []);

  const handleInputChange = (field: keyof SignupFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    // Required fields validation
    if (!formData.tenantName.trim()) newErrors.tenantName = 'Tenant name is required';
    if (!formData.ntn.trim()) newErrors.ntn = 'NTN is required';
    if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required';
    if (!formData.businessNatureId || formData.businessNatureId === 0) (newErrors as any).businessNatureId = 'Business nature is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (!formData.fbrSandboxClientId.trim()) newErrors.fbrSandboxClientId = 'FBR Sandbox Token is required';
    if (!formData.fbrProductionClientId.trim()) newErrors.fbrProductionClientId = 'FBR Production Token is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.businessEmail && !emailRegex.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid business email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // NTN validation (basic format: 1234567-8)
    const ntnRegex = /^\d{7}-\d$/;
    if (formData.ntn && !ntnRegex.test(formData.ntn)) {
      newErrors.ntn = 'NTN must be in format: 1234567-8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Tenant data
          name: formData.tenantName,
          ntn: formData.ntn,
          businessAddress: formData.businessAddress,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail,
          businessNatureId: formData.businessNatureId,
          fbrSandboxClientId: formData.fbrSandboxClientId,
          fbrProductionClientId: formData.fbrProductionClientId,
          
          // User data
          adminUser: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Tenant registered successfully! You can now login.');
        router.push('/login');
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="flex justify-center">
          <BuildingOfficeIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Register Your Business
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your tenant account and start managing digital invoices
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Business Registration</CardTitle>
            <CardDescription>
              Complete the form below to register your business for digital invoicing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenantName">Business Name *</Label>
                    <Input
                      id="tenantName"
                      type="text"
                      value={formData.tenantName}
                      onChange={(e) => handleInputChange('tenantName', e.target.value)}
                      placeholder="Enter business name"
                      className={errors.tenantName ? 'border-red-500' : ''}
                    />
                    {errors.tenantName && (
                      <p className="text-red-500 text-sm mt-1">{errors.tenantName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="businessNature">Business Nature *</Label>
                    <Select
                      value={formData.businessNatureId.toString()}
                      onValueChange={(value) => handleInputChange('businessNatureId', parseInt(value))}
                      disabled={loadingBusinessNatures}
                    >
                      <SelectTrigger className={errors.businessNatureId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loadingBusinessNatures ? "Loading..." : "Select business nature"} />
                      </SelectTrigger>
                      <SelectContent>
                        {businessNatures.map((nature) => (
                          <SelectItem key={nature.id} value={nature.id.toString()}>
                            {nature.businessnature}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.businessNatureId && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessNatureId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ntn">NTN (National Tax Number) *</Label>
                    <Input
                      id="ntn"
                      type="text"
                      value={formData.ntn}
                      onChange={(e) => handleInputChange('ntn', e.target.value)}
                      placeholder="1234567-8"
                      className={errors.ntn ? 'border-red-500' : ''}
                    />
                    {errors.ntn && (
                      <p className="text-red-500 text-sm mt-1">{errors.ntn}</p>
                    )}
                  </div>


                  <div>
                    <Label htmlFor="businessEmail">Business Email *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      placeholder="business@example.com"
                      className={errors.businessEmail ? 'border-red-500' : ''}
                    />
                    {errors.businessEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      placeholder="+92-300-1234567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    type="text"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Enter complete business address"
                  />
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  User Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="admin@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+92-300-1234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter password"
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm password"
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* FBR Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  FBR Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fbrSandboxClientId">FBR Sandbox Token *</Label>
                    <Input
                      id="fbrSandboxClientId"
                      type="text"
                      value={formData.fbrSandboxClientId}
                      onChange={(e) => handleInputChange('fbrSandboxClientId', e.target.value)}
                      placeholder="Enter FBR Sandbox Client ID"
                      className={errors.fbrSandboxClientId ? 'border-red-500' : ''}
                    />
                    {errors.fbrSandboxClientId && (
                      <p className="text-red-500 text-sm mt-1">{errors.fbrSandboxClientId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fbrProductionClientId">FBR Production Client ID *</Label>
                    <Input
                      id="fbrProductionClientId"
                      type="text"
                      value={formData.fbrProductionClientId}
                      onChange={(e) => handleInputChange('fbrProductionClientId', e.target.value)}
                      placeholder="Enter FBR Production Client ID"
                      className={errors.fbrProductionClientId ? 'border-red-500' : ''}
                    />
                    {errors.fbrProductionClientId && (
                      <p className="text-red-500 text-sm mt-1">{errors.fbrProductionClientId}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
