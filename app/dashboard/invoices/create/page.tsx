'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  PlusIcon, 
  TrashIcon,
  CalculatorIcon,
  DocumentTextIcon,
  UserIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface HSCode {
  id: number;
  hsCode: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface SaleType {
  id: number;
  transactionDesc: string;
}

interface InvoiceItem {
  id: string;
  productDescription: string;
  hsCode: string;
  rate: string;
  uoM: string;
  quantity: string;
  totalValues: string;
  valueSalesExcludingST: string;
  fixedNotifiedValueOrRetailPrice: string;
  salesTaxApplicable: string;
  salesTaxWithheldAtSource: string;
  extraTax: string;
  furtherTax: string;
  sroScheduleNo: string;
  fedPayable: string;
  discount: string;
  saleType: string;
  sroItemSerialNo: string;
}

interface InvoiceForm {
  invoiceRefNo: string;
  invoiceType: string;
  invoiceDate: string;
  buyerBusinessName: string;
  buyerNTNCNIC: string;
  buyerProvince: string;
  buyerAddress: string;
  buyerRegistrationType: string;
  scenarioId: string;
  items: InvoiceItem[];
}

export default function CreateInvoicePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [hsCodes, setHsCodes] = useState<HSCode[]>([]);
  const [isLoadingHsCodes, setIsLoadingHsCodes] = useState(false);
  const [hsCodeSearch, setHsCodeSearch] = useState<{ [itemId: string]: string }>({});
  const [showHsCodeDropdown, setShowHsCodeDropdown] = useState<{ [itemId: string]: boolean }>({});
  const [saleTypes, setSaleTypes] = useState<SaleType[]>([]);
  const [isLoadingSaleTypes, setIsLoadingSaleTypes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check permissions on component mount
  useEffect(() => {
    if (!authLoading && user) {
      // Admin users (roleId === 1) cannot create invoices
      if (user.roleId === 1) {
        router.push('/dashboard/invoices?error=access_denied');
        return;
      }
      setIsCheckingPermissions(false);
    }
  }, [user, authLoading, router]);

  // Fetch HS codes
  useEffect(() => {
    const fetchHsCodes = async () => {
      try {
        setIsLoadingHsCodes(true);
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
          console.error('No authorization token found');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const response = await fetch(`${apiUrl}/system-configs/hs-codes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setHsCodes(data.data);
          }
        } else {
          console.error('Failed to fetch HS codes:', response.status);
        }
      } catch (error) {
        console.error('Error fetching HS codes:', error);
      } finally {
        setIsLoadingHsCodes(false);
      }
    };

    fetchHsCodes();
  }, []);

  // Fetch Sale Types
  useEffect(() => {
    const fetchSaleTypes = async () => {
      try {
        setIsLoadingSaleTypes(true);
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
          console.error('No authorization token found');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const response = await fetch(`${apiUrl}/system-configs/sale-type`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSaleTypes(data.data);
          }
        } else {
          console.error('Failed to fetch sale types:', response.status);
        }
      } catch (error) {
        console.error('Error fetching sale types:', error);
      } finally {
        setIsLoadingSaleTypes(false);
      }
    };

    fetchSaleTypes();
  }, []);

  // Filter HS codes based on search
  const getFilteredHsCodes = (itemId: string) => {
    const searchTerm = hsCodeSearch[itemId] || '';
    if (!searchTerm) return hsCodes;
    return hsCodes.filter(hsCode => 
      hsCode.hsCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const [form, setForm] = useState<InvoiceForm>({
    invoiceRefNo: '',
    invoiceType: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    buyerBusinessName: '',
    buyerNTNCNIC: '',
    buyerProvince: '',
    buyerAddress: '',
    buyerRegistrationType: '',
    scenarioId: '',
    items: [
      {
        id: '1',
        productDescription: '',
        hsCode: '',
        rate: '',
        uoM: '',
        quantity: '',
        totalValues: '',
        valueSalesExcludingST: '',
        fixedNotifiedValueOrRetailPrice: '',
        salesTaxApplicable: '',
        salesTaxWithheldAtSource: '',
        extraTax: '',
        furtherTax: '',
        sroScheduleNo: '',
        fedPayable: '',
        discount: '',
        saleType: '',
        sroItemSerialNo: ''
      }
    ]
  });

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productDescription: '',
      hsCode: '',
      rate: '',
      uoM: '',
      quantity: '',
      totalValues: '',
      valueSalesExcludingST: '',
      fixedNotifiedValueOrRetailPrice: '',
      salesTaxApplicable: '',
      salesTaxWithheldAtSource: '',
      extraTax: '',
      furtherTax: '',
      sroScheduleNo: '',
      fedPayable: '',
      discount: '',
      saleType: '',
      sroItemSerialNo: ''
    };
    setForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    if (form.items.length > 1) {
      setForm(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate values when rate or sales tax excluding ST changes
          if (field === 'quantity' || field === 'rate') {
            // No automatic calculation - user must enter values manually
          }
          
          // Auto-calculate sales tax applicable when sales excluding ST changes
          if (field === 'valueSalesExcludingST') {
            const rateValue = parseFloat(updatedItem.rate) || 0;
            const salesExcludingST = parseFloat(updatedItem.valueSalesExcludingST) || 0;
            if (rateValue > 0 && salesExcludingST > 0) {
              updatedItem.salesTaxApplicable = ((salesExcludingST * rateValue) / 100).toString();
            } else {
              updatedItem.salesTaxApplicable = '';
            }
          }
          
          // Auto-calculate total values when tax fields change
          if (field === 'valueSalesExcludingST' || field === 'salesTaxApplicable' || 
              field === 'salesTaxWithheldAtSource' || field === 'extraTax' || 
              field === 'furtherTax' || field === 'fedPayable' || field === 'discount') {
            const salesExcludingST = parseFloat(updatedItem.valueSalesExcludingST) || 0;
            const salesTaxApplicable = parseFloat(updatedItem.salesTaxApplicable) || 0;
            const salesTaxWithheld = parseFloat(updatedItem.salesTaxWithheldAtSource) || 0;
            const extraTaxAmount = parseFloat(updatedItem.extraTax) || 0;
            const furtherTaxAmount = parseFloat(updatedItem.furtherTax) || 0;
            const fedPayableAmount = parseFloat(updatedItem.fedPayable) || 0;
            const discountAmount = parseFloat(updatedItem.discount) || 0;
            
            // Total = Sales Excluding ST + Sales Tax Applicable + Sales Tax + Extra Tax + Further Tax + FED Payable - Discount
            const totalValue = salesExcludingST + salesTaxApplicable + salesTaxWithheld + 
                             extraTaxAmount + furtherTaxAmount + fedPayableAmount - discountAmount;
            updatedItem.totalValues = totalValue.toString();
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => sum + (parseFloat(item.valueSalesExcludingST) || 0), 0);
    const taxAmount = form.items.reduce((sum, item) => sum + (parseFloat(item.salesTaxApplicable) || 0) + (parseFloat(item.salesTaxWithheldAtSource) || 0) + (parseFloat(item.extraTax) || 0) + (parseFloat(item.furtherTax) || 0), 0);
    const total = form.items.reduce((sum, item) => sum + (parseFloat(item.totalValues) || 0), 0);
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting invoice:', form);
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        setModalType('error');
        setModalMessage('No authorization token found. Please login again.');
        setShowModal(true);
        setIsSubmitting(false);
        return;
      }

      const { total } = calculateTotals();
      
      // Add percentage sign to rate fields before sending
      const formWithPercentageRate = {
        ...form,
        items: form.items.map(item => ({
          ...item,
          rate: item.rate ? `${item.rate}%` : item.rate
        })),
        totalAmount: total.toString()
      };
      
      const payload = formWithPercentageRate;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setModalType('success');
        setModalMessage('Invoice created successfully! You will be redirected to the invoices list.');
        setShowModal(true);
      } else {
        const errorMessage = data.message || data.error || 'Failed to create invoice';
        setModalType('error');
        setModalMessage(`Failed to create invoice: ${errorMessage}`);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setModalType('error');
      setModalMessage('Error creating invoice. Please try again.');
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === 'success') {
      router.push('/dashboard/invoices');
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  // Show loading while checking permissions
  if (authLoading || isCheckingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied if user is not authorized
  if (!user || user.roleId === 1) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to create invoices.</p>
          <Button onClick={() => router.push('/dashboard/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600">Create a new invoice for your customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5" />
              <span>Invoice Details</span>
            </CardTitle>
            <CardDescription>Basic invoice information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Reference Number</label>
                <Input
                  value={form.invoiceRefNo}
                  onChange={(e) => setForm(prev => ({ ...prev, invoiceRefNo: e.target.value }))}
                  placeholder="INV-2024-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Type</label>
                <select
                  value={form.invoiceType}
                  onChange={(e) => setForm(prev => ({ ...prev, invoiceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Invoice Type</option>
                  <option value="Sale Invoice">Sale Invoice</option>
                  <option value="Debit Note">Debit Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                <Input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => setForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scenario ID</label>
                <Input
                  value={form.scenarioId}
                  onChange={(e) => setForm(prev => ({ ...prev, scenarioId: e.target.value }))}
                  placeholder="Enter scenario ID (e.g., ABC123)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Buyer Information</span>
            </CardTitle>
            <CardDescription>Buyer details for FBR compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <Input
                  value={form.buyerBusinessName}
                  onChange={(e) => setForm(prev => ({ ...prev, buyerBusinessName: e.target.value }))}
                  placeholder="Buyer Company Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NTN/CNIC</label>
                <Input
                  value={form.buyerNTNCNIC}
                  onChange={(e) => setForm(prev => ({ ...prev, buyerNTNCNIC: e.target.value }))}
                  placeholder="7-digit NTN or 13-digit CNIC"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  value={form.buyerProvince}
                  onChange={(e) => setForm(prev => ({ ...prev, buyerProvince: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Province</option>
                  <option value="PUNJAB">Punjab</option>
                  <option value="SINDH">Sindh</option>
                  <option value="KPK">KPK</option>
                  <option value="BALOCHISTAN">Balochistan</option>
                  <option value="ISLAMABAD">Islamabad</option>
                  <option value="AJK">AJK</option>
                  <option value="GB">Gilgit-Baltistan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Type</label>
                <select
                  value={form.buyerRegistrationType}
                  onChange={(e) => setForm(prev => ({ ...prev, buyerRegistrationType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Registration Type</option>
                  <option value="Registered">Registered</option>
                  <option value="Unregistered">Unregistered</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Input
                value={form.buyerAddress}
                onChange={(e) => setForm(prev => ({ ...prev, buyerAddress: e.target.value }))}
                placeholder="Buyer address"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalculatorIcon className="h-5 w-5" />
              <span>Invoice Items</span>
            </CardTitle>
            <CardDescription>Add products or services to your invoice (FBR compliant)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-4">
                  {/* Basic Product Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
                    <Input
                        value={item.productDescription}
                        onChange={(e) => updateItem(item.id, 'productDescription', e.target.value)}
                        placeholder="Product description"
                      required
                    />
                  </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HS Code</label>
                    <div className="relative">
                      <Input
                        value={item.hsCode}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateItem(item.id, 'hsCode', value);
                          setHsCodeSearch(prev => ({ ...prev, [item.id]: value }));
                          setShowHsCodeDropdown(prev => ({ ...prev, [item.id]: true }));
                        }}
                        onFocus={() => {
                          setShowHsCodeDropdown(prev => ({ ...prev, [item.id]: true }));
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowHsCodeDropdown(prev => ({ ...prev, [item.id]: false }));
                          }, 150);
                        }}
                        placeholder="Type to search HS Code"
                        className="w-full"
                      />
                      {showHsCodeDropdown[item.id] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {isLoadingHsCodes ? (
                            <div className="px-3 py-2 text-sm text-gray-500">Loading HS Codes...</div>
                          ) : getFilteredHsCodes(item.id).length > 0 ? (
                            getFilteredHsCodes(item.id).map((hsCode) => (
                              <div
                                key={hsCode.id}
                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  updateItem(item.id, 'hsCode', hsCode.hsCode);
                                  setShowHsCodeDropdown(prev => ({ ...prev, [item.id]: false }));
                                }}
                              >
                                {hsCode.hsCode}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No HS codes found</div>
                          )}
                        </div>
                      )}
                    </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">UoM</label>
                      <select
                        value={item.uoM}
                        onChange={(e) => updateItem(item.id, 'uoM', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select UoM</option>
                        <option value="PCS">PCS</option>
                        <option value="KG">KG</option>
                        <option value="LTR">LTR</option>
                        <option value="MTR">MTR</option>
                        <option value="SQM">SQM</option>
                        <option value="CBM">CBM</option>
                      </select>
                    </div>
                  </div>

                  {/* Quantity and Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        min="1"
                        placeholder="Enter quantity"
                        required
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate (%)</label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Enter rate percentage"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Values</label>
                      <Input
                        type="number"
                        value={item.totalValues}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Excl. ST</label>
                      <Input
                        type="number"
                        value={item.valueSalesExcludingST}
                        onChange={(e) => updateItem(item.id, 'valueSalesExcludingST', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="Enter sales excluding ST"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Notified Value/Retail Price</label>
                      <Input
                        type="number"
                        value={item.fixedNotifiedValueOrRetailPrice}
                        onChange={(e) => updateItem(item.id, 'fixedNotifiedValueOrRetailPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="Enter fixed notified value"
                      />
                    </div>
                  </div>

                  {/* Tax Information */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Tax Applicable</label>
                      <Input
                        type="number"
                        value={item.salesTaxApplicable}
                        onChange={(e) => updateItem(item.id, 'salesTaxApplicable', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="Auto-calculated"
                        className="bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Tax</label>
                      <Input
                        type="number"
                        value={item.salesTaxWithheldAtSource}
                        onChange={(e) => updateItem(item.id, 'salesTaxWithheldAtSource', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Enter sales tax"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Extra Tax</label>
                      <Input
                        type="number"
                        value={item.extraTax}
                        onChange={(e) => updateItem(item.id, 'extraTax', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Enter extra tax"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Further Tax</label>
                      <Input
                        type="number"
                        value={item.furtherTax}
                        onChange={(e) => updateItem(item.id, 'furtherTax', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Enter further tax"
                      />
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SRO Schedule No</label>
                      <Input
                        type="number"
                        value={item.sroScheduleNo}
                        onChange={(e) => updateItem(item.id, 'sroScheduleNo', e.target.value)}
                        min="0"
                        placeholder="Enter SRO schedule no"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">FED Payable</label>
                      <Input
                        type="number"
                        value={item.fedPayable}
                        onChange={(e) => updateItem(item.id, 'fedPayable', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Enter FED payable"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Enter discount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sale Type</label>
                      <select
                        value={item.saleType}
                        onChange={(e) => updateItem(item.id, 'saleType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isLoadingSaleTypes}
                      >
                        <option value="">{isLoadingSaleTypes ? 'Loading...' : 'Select Sale Type'}</option>
                        {saleTypes.map((saleType) => (
                          <option key={saleType.id} value={saleType.transactionDesc}>
                            {saleType.transactionDesc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SRO Item Serial No and Remove Button */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SRO Item Serial No</label>
                      <Input
                        value={item.sroItemSerialNo}
                        onChange={(e) => updateItem(item.id, 'sroItemSerialNo', e.target.value)}
                        placeholder="SRO Item Serial No"
                      />
                    </div>
                    <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={form.items.length === 1}
                      className="w-full"
                    >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Remove Item
                    </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5" />
              <span>Invoice Summary</span>
            </CardTitle>
            <CardDescription>FBR compliant invoice totals</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                <span className="text-gray-600">Net Amount (Sales Excluding ST):</span>
                  <span className="font-medium">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                <span className="text-gray-600">Total Tax Amount:</span>
                  <span className="font-medium">PKR {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total Amount:</span>
                  <span>PKR {total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button" onClick={() => router.push('/dashboard/invoices')}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>

      {/* Success/Error Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
                {modalType === 'success' ? (
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircleIcon className="h-12 w-12 text-red-500" />
                )}
              </div>
              <h3 className={`text-lg font-medium ${modalType === 'success' ? 'text-gray-900' : 'text-red-900'}`}>
                {modalType === 'success' ? 'Success!' : 'Error!'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className={`text-sm ${modalType === 'success' ? 'text-gray-500' : 'text-red-500'}`}>
                  {modalMessage}
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <Button
                  onClick={handleModalClose}
                  className={`w-full ${
                    modalType === 'success' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {modalType === 'success' ? 'Continue' : 'Try Again'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
