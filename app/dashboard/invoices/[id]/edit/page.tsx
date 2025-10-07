'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  PlusIcon, 
  TrashIcon,
  CalculatorIcon,
  DocumentTextIcon,
  UserIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { SuccessModal } from '@/app/components/ui/success-modal';

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

export default function EditInvoicePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleTypes, setSaleTypes] = useState<SaleType[]>([]);
  const [isLoadingSaleTypes, setIsLoadingSaleTypes] = useState(false);

  // Check permissions on component mount
  useEffect(() => {
    if (!authLoading && user) {
      // Admin users (roleId === 1) cannot edit invoices
      if (user.roleId === 1) {
        router.push('/dashboard/invoices?error=access_denied');
        return;
      }
      setIsCheckingPermissions(false);
    }
  }, [user, authLoading, router]);

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

  const [form, setForm] = useState<InvoiceForm>({
    invoiceRefNo: '',
    invoiceType: 'Sale Invoice',
    invoiceDate: '',
    buyerBusinessName: '',
    buyerNTNCNIC: '',
    buyerProvince: '',
    buyerAddress: '',
    buyerRegistrationType: 'Registered',
    scenarioId: '',
    items: []
  });

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
          setError('No authorization token found. Please login again.');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const response = await fetch(`${apiUrl}/invoice/${params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const invoice = data.data;
            
            // Map old invoice type format to new format
            const mapInvoiceType = (type: string) => {
              switch (type) {
                case 'SALE':
                case 'SALE INVOICE':
                  return 'Sale Invoice';
                case 'DEBIT_NOTE':
                case 'DEBIT NOTE':
                  return 'Debit Note';
                default:
                  return type || 'Sale Invoice';
              }
            };
            
            // Map old buyer registration type format to new format
            const mapBuyerRegistrationType = (type: string) => {
              switch (type) {
                case 'REGISTERED':
                  return 'Registered';
                case 'UNREGISTERED':
                  return 'Unregistered';
                case 'CONSUMER':
                  return 'Registered'; // Map Consumer to Registered as fallback
                default:
                  return type || 'Registered';
              }
            };
            
            setForm({
              invoiceRefNo: invoice.invoiceRefNo || '',
              invoiceType: mapInvoiceType(invoice.invoiceType),
              invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
              buyerBusinessName: invoice.buyerBusinessName || '',
              buyerNTNCNIC: invoice.buyerNTNCNIC || '',
              buyerProvince: invoice.buyerProvince || '',
              buyerAddress: invoice.buyerAddress || '',
              buyerRegistrationType: mapBuyerRegistrationType(invoice.buyerRegistrationType),
              scenarioId: invoice.scenarioId?.toString() || '',
              items: invoice.items?.map((item: any, index: number) => ({
                id: item.id?.toString() || (index + 1).toString(),
                productDescription: item.productDescription || '',
                hsCode: item.hsCode || '',
                rate: item.rate?.toString().replace('%', '') || '',
                uoM: item.uoM || 'PCS',
                quantity: item.quantity?.toString() || '',
                totalValues: item.totalValues?.toString() || '',
                valueSalesExcludingST: item.valueSalesExcludingST?.toString() || '',
                fixedNotifiedValueOrRetailPrice: item.fixedNotifiedValueOrRetailPrice?.toString() || '',
                salesTaxApplicable: item.salesTaxApplicable?.toString() || '',
                salesTaxWithheldAtSource: item.salesTaxWithheldAtSource?.toString() || '',
                extraTax: item.extraTax?.toString() || '',
                furtherTax: item.furtherTax?.toString() || '',
                sroScheduleNo: item.sroScheduleNo?.toString() || '',
                fedPayable: item.fedPayable?.toString() || '',
                discount: item.discount?.toString() || '',
                saleType: item.saleType || 'LOCAL',
                sroItemSerialNo: item.sroItemSerialNo || ''
              })) || []
            });
            setIsDataLoaded(true);
          } else {
            setError(data.message || 'Failed to fetch invoice');
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch invoice');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Error fetching invoice. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productDescription: '',
      hsCode: '',
      rate: '',
      uoM: 'PCS',
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
      saleType: 'LOCAL',
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
          
          // Only perform calculations after data is loaded and user is making changes
          if (isDataLoaded) {
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
    console.log('Updating invoice:', form);
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        alert('No authorization token found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      
      // Add percentage sign to rate fields before sending
      const formWithPercentageRate = {
        ...form,
        items: form.items.map(item => ({
          ...item,
          rate: item.rate ? `${item.rate}%` : item.rate
        })),
        totalAmount: calculateTotals().total.toString()
      };
      
      const response = await fetch(`${apiUrl}/invoice/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formWithPercentageRate),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccessModal(true);
      } else {
        const errorMessage = data.message || data.error || 'Failed to update invoice';
        alert(`Failed to update invoice: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Error updating invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/dashboard/invoices/${params.id}`);
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  // Show loading while checking permissions
  if (authLoading || isCheckingPermissions || isLoading) {
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
          <p className="text-gray-600 mb-4">You don't have permission to edit invoices.</p>
          <Button onClick={() => router.push('/dashboard/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/invoices/${params.id}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Invoice</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
          <p className="text-gray-600">Update invoice details and items</p>
        </div>
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
                      <Input
                        value={item.hsCode}
                        onChange={(e) => updateItem(item.id, 'hsCode', e.target.value)}
                        placeholder="HS Code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">UoM</label>
                      <select
                        value={item.uoM}
                        onChange={(e) => updateItem(item.id, 'uoM', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
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
                        onChange={(e) => updateItem(item.id, 'valueSalesExcludingST', e.target.value)}
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
                        onChange={(e) => updateItem(item.id, 'fixedNotifiedValueOrRetailPrice', e.target.value)}
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
                        onChange={(e) => updateItem(item.id, 'salesTaxApplicable', e.target.value)}
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
          <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/invoices/${params.id}`)}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Invoice'}
          </Button>
        </div>
      </form>

      {/* Success Modal for Invoice Update */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Invoice Updated Successfully!"
        message="Your invoice has been updated successfully. You will be redirected to the invoice details page."
        buttonText="Continue"
        onButtonClick={handleSuccessModalClose}
      />
    </div>
  );
}
