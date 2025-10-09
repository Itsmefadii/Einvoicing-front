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
import { SuccessModal } from '@/app/components/ui/success-modal';
import { dataService } from '@/lib/data-service';

interface BusinessNature {
  id: number;
  businessnature: string;
}

interface Industry {
  id: number;
  industryName: string;
}

interface State {
  id: number;
  state: string;
  stateCode: number;
}

interface SignupFormData {
  // Seller Information
  sellerName: string;
  ntn: string;
  businessAddress1: string;
  businessAddress2: string;
  city: string;
  stateId: number;
  postalCode: string;
  businessPhone: string;
  businessEmail: string;
  businessNatureId: number;
  industryId: number;
  
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
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loadingBusinessNatures, setLoadingBusinessNatures] = useState(true);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<SignupFormData>({
    sellerName: '',
    ntn: '',
    businessAddress1: '',
    businessAddress2: '',
    city: '',
    stateId: 0,
    postalCode: '',
    businessPhone: '',
    businessEmail: '',
    businessNatureId: 0,
    industryId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fbrSandboxClientId: '',
    fbrProductionClientId: '',
  });

  // Fetch business natures, industries, and states on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingBusinessNatures(true);
        setLoadingIndustries(true);
        setLoadingStates(true);
        
        // Fetch business natures
        const natures = await dataService.getBusinessNatures();
        setBusinessNatures(natures);
        if (natures.length > 0) {
          setFormData(prev => ({ ...prev, businessNatureId: natures[0].id }));
        }
        
        // Fetch industries
        const industries = await dataService.getIndustries();
        setIndustries(industries);
        if (industries.length > 0) {
          setFormData(prev => ({ ...prev, industryId: industries[0].id }));
        }
        
        // Fetch states
        const states = await dataService.getStates();
        setStates(states);
        if (states.length > 0) {
          setFormData(prev => ({ ...prev, stateId: states[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingBusinessNatures(false);
        setLoadingIndustries(false);
        setLoadingStates(false);
      }
    };

    fetchData();
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
    if (!formData.sellerName.trim()) newErrors.sellerName = 'Seller name is required';
    if (!formData.ntn.trim()) newErrors.ntn = 'NTN is required';
    if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required';
    if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
    if (!formData.businessAddress1.trim()) newErrors.businessAddress1 = 'Address 1 is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.stateId || formData.stateId === 0) (newErrors as any).stateId = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.businessNatureId || formData.businessNatureId === 0) (newErrors as any).businessNatureId = 'Business nature is required';
    if (!formData.industryId || formData.industryId === 0) (newErrors as any).industryId = 'Industry is required';
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
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          user: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            roleId: 2,
            password: formData.password,
          },
          seller: {
            businessName: formData.sellerName,
            ntnCnic: formData.ntn,
            businessNatureId: formData.businessNatureId,
            industryId: formData.industryId,
            address1: formData.businessAddress1,
            address2: formData.businessAddress2,
            city: formData.city,
            stateId: formData.stateId,
            postalCode: formData.postalCode,
            businessPhone: formData.businessPhone,
            businessEmail: formData.businessEmail,
            fbrSandBoxToken: formData.fbrSandboxClientId,
            fbrProdToken: formData.fbrProductionClientId,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowSuccessModal(true);
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
          Create your seller account and start managing digital invoices
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
                    <Label htmlFor="sellerName">Business Name *</Label>
                    <Input
                      id="sellerName"
                      type="text"
                      value={formData.sellerName}
                      onChange={(e) => handleInputChange('sellerName', e.target.value)}
                      placeholder="Enter business name"
                      className={errors.sellerName ? 'border-red-500' : ''}
                    />
                    {errors.sellerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.sellerName}</p>
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
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={formData.industryId.toString()}
                      onValueChange={(value) => handleInputChange('industryId', parseInt(value))}
                      disabled={loadingIndustries}
                    >
                      <SelectTrigger className={errors.industryId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loadingIndustries ? "Loading..." : "Select industry"} />
                      </SelectTrigger>
                      <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id.toString()}>
                          {industry.industryName}
                        </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                    {errors.industryId && (
                      <p className="text-red-500 text-sm mt-1">{errors.industryId}</p>
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
                    <Label htmlFor="businessPhone">Business Phone *</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      placeholder="+92-300-1234567"
                      className={errors.businessPhone ? 'border-red-500' : ''}
                    />
                    {errors.businessPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessAddress1">Address 1 *</Label>
                  <Input
                    id="businessAddress1"
                    type="text"
                    value={formData.businessAddress1}
                    onChange={(e) => handleInputChange('businessAddress1', e.target.value)}
                    placeholder="Street address, building number"
                    className={errors.businessAddress1 ? 'border-red-500' : ''}
                  />
                  {errors.businessAddress1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessAddress1}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="businessAddress2">Address 2</Label>
                  <Input
                    id="businessAddress2"
                    type="text"
                    value={formData.businessAddress2}
                    onChange={(e) => handleInputChange('businessAddress2', e.target.value)}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.stateId.toString()}
                      onValueChange={(value) => handleInputChange('stateId', parseInt(value))}
                      disabled={loadingStates}
                    >
                      <SelectTrigger className={errors.stateId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loadingStates ? "Loading..." : "Select state"} />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.stateId && (
                      <p className="text-red-500 text-sm mt-1">{errors.stateId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="Enter postal code"
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
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

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Seller Created Successfully!"
          message="Your seller account has been created successfully. You can now login with your credentials."
          buttonText="Go to Login"
          onButtonClick={() => {
            setShowSuccessModal(false);
            router.push('/login');
          }}
        />
      </div>
    </div>
  );
}
