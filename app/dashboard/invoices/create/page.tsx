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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface InvoiceItem {
  id: string;
  description: string;
  hsCode?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  amount: number;
}

interface InvoiceForm {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerNtn: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  notes: string;
  taxRate: number;
  items: InvoiceItem[];
}

export default function CreateInvoicePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

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

  const [form, setForm] = useState<InvoiceForm>({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: '',
    customerNtn: '',
    customerEmail: '',
    customerAddress: '',
    customerPhone: '',
    notes: '',
    taxRate: 15,
    items: [
      {
        id: '1',
        description: '',
        hsCode: '',
        quantity: 1,
        unitPrice: 0,
        taxPercentage: 15,
        amount: 0
      }
    ]
  });

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      hsCode: '',
      quantity: 1,
      unitPrice: 0,
      taxPercentage: 15,
      amount: 0
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
          // Auto-calculate amount
          if (field === 'quantity' || field === 'unitPrice' || field === 'taxPercentage') {
            updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * (1 + updatedItem.taxPercentage / 100);
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxPercentage / 100), 0);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting invoice:', form);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Invoice created successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Failed to create invoice:', error);
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => setForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="INV-2024-001"
                  required
                />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Customer Information</span>
            </CardTitle>
            <CardDescription>Customer details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <Input
                  value={form.customerName}
                  onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer Company Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NTN</label>
                <Input
                  value={form.customerNtn}
                  onChange={(e) => setForm(prev => ({ ...prev, customerNtn: e.target.value }))}
                  placeholder="7-digit NTN"
                  pattern="[0-9]{7}"
                  maxLength={7}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input
                  value={form.customerPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Input
                value={form.customerAddress}
                onChange={(e) => setForm(prev => ({ ...prev, customerAddress: e.target.value }))}
                placeholder="Customer address"
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
            <CardDescription>Add products or services to your invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">HS Code</label>
                    <Input
                      value={item.hsCode}
                      onChange={(e) => updateItem(item.id, 'hsCode', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qty</label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax %</label>
                    <Input
                      type="number"
                      value={item.taxPercentage}
                      onChange={(e) => updateItem(item.id, 'taxPercentage', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="col-span-12 md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={form.items.length === 1}
                      className="w-full"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    Amount: PKR {item.amount.toLocaleString()}
                  </span>
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

        {/* Totals and Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5" />
              <span>Totals and Notes</span>
            </CardTitle>
            <CardDescription>Invoice summary and additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Amount:</span>
                  <span className="font-medium">PKR {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes or terms..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button">
            Save as Draft
          </Button>
          <Button type="submit" className="min-w-[120px]">
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
