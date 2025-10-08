'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { PrinterIcon, PaperAirplaneIcon, CheckCircleIcon, XCircleIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth-context'
import InvoicePrint from '@/app/components/invoice-print'

type InvoiceItem = {
  id: number
  hsCode: string
  productDescription: string
  rate: string
  uoM: string
  quantity: string
  totalValues: string
  valueSalesExcludingST: string
  fixedNotifiedValueOrRetailPrice: string
  salesTaxApplicable: string
  salesTaxWithheldAtSource: string
  extraTax: string
  furtherTax: string
  sroScheduleNo: number
  fedPayable: string
  discount: string
  saleType: string
  sroItemSerialNo: string
  error?: string
}

type BusinessNature = {
  id: number
  businessNature: string
}

type Industry = {
  id: number
  industryName: string
}

type Seller = {
  id: number
  businessName: string
  ntnCnic: string
  businessNatureId: number
  industryId: number
  stateId: number
  address1: string
  address2: string
  city: string
  postalCode: string
  businessPhone: string
  businessEmail: string
  businessNature: BusinessNature
  industry: Industry
}

type Invoice = {
  id: number
  sellerId: number
  invoiceType: string
  invoiceDate: string
  buyerNTNCNIC: string
  buyerBusinessName: string
  buyerProvince: string
  buyerAddress: string
  buyerRegistrationType: string
  invoiceRefNo: string
  scenarioId: number
  totalAmount: string
  status: string
  fbrInvoiceNumber?: string | null
  createdAt: string
  updatedAt: string
  items: InvoiceItem[]
  seller: Seller
  error?: string
}

type SectionKey = 'seller' | 'buyer' | 'products' | 'tax'

type FieldVisibility = {
  // Seller
  sellerName: boolean
  sellerNtnStrn: boolean
  sellerAddress: boolean
  sellerContact: boolean
  // Buyer
  buyerName: boolean
  buyerNtnCnic: boolean
  buyerAddress: boolean
  buyerContact: boolean
  // Products columns (all fields are now always shown)
  // Tax details
  taxNetAmount: boolean
  taxTaxAmount: boolean
  taxTotalAmount: boolean
  taxFbrStatus: boolean
  taxIrn: boolean
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency || 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toFixed(0)} ${currency || 'PKR'}`
  }
}

function loadLayoutConfig(sellerId: string | undefined): SectionKey[] {
  if (!sellerId || typeof window === 'undefined') return ['seller', 'buyer', 'products', 'tax']
  try {
    const stored = localStorage.getItem(`invoice_view_layout_${sellerId}`)
    if (!stored) return ['seller', 'buyer', 'products', 'tax']
    const parsed = JSON.parse(stored) as SectionKey[]
    const defaults: SectionKey[] = ['seller', 'buyer', 'products', 'tax']
    const unique = Array.from(new Set(parsed.filter((k): k is SectionKey => defaults.includes(k))))
    // Ensure all defaults exist exactly once
    const missing = defaults.filter(k => !unique.includes(k))
    return [...unique, ...missing]
  } catch {
    return ['seller', 'buyer', 'products', 'tax']
  }
}

function saveLayoutConfig(sellerId: string | undefined, layout: SectionKey[]) {
  if (!sellerId || typeof window === 'undefined') return
  localStorage.setItem(`invoice_view_layout_${sellerId}`, JSON.stringify(layout))
}

function defaultFieldVisibility(): FieldVisibility {
  return {
    sellerName: true,
    sellerNtnStrn: true,
    sellerAddress: true,
    sellerContact: true,
    buyerName: true,
    buyerNtnCnic: true,
    buyerAddress: true,
    buyerContact: true,
    taxNetAmount: true,
    taxTaxAmount: true,
    taxTotalAmount: true,
    taxFbrStatus: true,
    taxIrn: true,
  }
}

function loadFieldVisibility(sellerId: string | undefined): FieldVisibility {
  if (!sellerId || typeof window === 'undefined') {
    return defaultFieldVisibility()
  }
  try {
    const stored = localStorage.getItem(`invoice_view_fields_${sellerId}`)
    if (!stored) return defaultFieldVisibility()
    const parsed = JSON.parse(stored) as Partial<FieldVisibility>
    return { ...defaultFieldVisibility(), ...parsed }
  } catch {
    return defaultFieldVisibility()
  }
}

function saveFieldVisibility(sellerId: string | undefined, vis: FieldVisibility) {
  if (!sellerId || typeof window === 'undefined') return
  localStorage.setItem(`invoice_view_fields_${sellerId}`, JSON.stringify(vis))
}

export default function InvoiceViewPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [layout, setLayout] = useState<SectionKey[]>(['seller', 'buyer', 'products', 'tax'])
  const [visibility, setVisibility] = useState<FieldVisibility>(defaultFieldVisibility())
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const { user } = useAuth()

  // Check if user is a seller
  const isSeller = user?.sellerId !== null || user?.sellerData !== undefined

  // Check if invoice status is submitted
  const isSubmitted = invoice?.status?.toLowerCase() === 'submitted'

  // Handle posting invoice to FBR
  const handlePostInvoice = async () => {
    if (!invoice) return;
    
    setIsPosting(true);
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        setModalType('error');
        setModalMessage('No authorization token found. Please login again.');
        setShowModal(true);
        setIsPosting(false);
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
          invoiceIds: [invoice.id]
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setModalType('success');
        setModalMessage('Invoice posted successfully to FBR!');
        setShowModal(true);
      } else {
        let errorMessage = data.message || data.error || 'Failed to post invoice';
        
        // Check if there's detailed FBR error information
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const firstError = data.data[0];
          if (firstError.fbrResponse && firstError.fbrResponse.validationResponse) {
            const fbrError = firstError.fbrResponse.validationResponse;
            errorMessage = `FBR Validation Error:\n\nError Code: ${fbrError.errorCode}\nError: ${fbrError.error}\nStatus: ${fbrError.status}`;
          }
        }
        
        setModalType('error');
        setModalMessage(`Failed to post invoice: ${errorMessage}`);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error posting invoice:', error);
      setModalType('error');
      setModalMessage('Error posting invoice. Please try again.');
      setShowModal(true);
    } finally {
      setIsPosting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Refresh the page only when user closes the success modal
    if (modalType === 'success') {
      window.location.reload();
    }
  };

  // Print function
  const handlePrint = async () => {
    if (typeof window !== 'undefined' && invoice) {
      // Import QRCode dynamically
      const QRCode = (await import('qrcode')).default as any;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        // Generate QR code data URL
        const qrValue = invoice.fbrInvoiceNumber || 'TEST123';
        let qrCodeDataUrl = '';
        let logoDataUrl = '';
        
        try {
          qrCodeDataUrl = await QRCode.toDataURL(qrValue, {
            width: 80,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (error) {
          console.error('Error generating QR code:', error);
        }

        // Convert logo to data URL
        try {
          const response = await fetch('/images/fbr_logo.png');
          const blob = await response.blob();
          logoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error loading logo:', error);
        }

        // Write the HTML structure
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoice.invoiceRefNo}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  line-height: 1.2;
                  color: #000;
                  background: white;
                }
                
                .invoice-print {
                  max-width: 100%;
                  margin: 0 auto;
                }
                
                .invoice-print * {
                  box-sizing: border-box;
                }
                
                .invoice-header {
                  position: relative;
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 15px;
                  min-height: 120px;
                }
                
                .fbr-logo {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 80px;
                  height: 80px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: white;
                  z-index: 10;
                }
                
                .fbr-logo img {
                  max-width: 100%;
                  max-height: 100%;
                  display: block;
                }
                
                .qr-code {
                  position: absolute;
                  top: 0;
                  right: 0;
                  width: 80px;
                  height: 80px;
                  border: 2px solid #000;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: white;
                  z-index: 10;
                }
                
                .qr-code img {
                  max-width: 100%;
                  max-height: 100%;
                  display: block;
                }
                
                .invoice-title {
                  font-size: 28px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  letter-spacing: 2px;
                }
                
                .invoice-number {
                  font-size: 18px;
                  font-weight: 600;
                }
                
                .invoice-date {
                  font-size: 14px;
                  color: #666;
                }
                
                .section {
                  margin-bottom: 25px;
                }
                
                .section-title {
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 3px;
                }
                
                .details-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  font-size: 11px;
                }
                
                .detail-item {
                  margin-bottom: 8px;
                }
                
                .detail-label {
                  font-weight: 600;
                  color: #333;
                  margin-bottom: 2px;
                }
                
                .detail-value {
                  color: #000;
                  word-wrap: break-word;
                }
                
                .products-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 10px;
                  margin-top: 10px;
                }
                
                .products-table th,
                .products-table td {
                  border: 1px solid #000;
                  padding: 4px 6px;
                  text-align: left;
                  vertical-align: top;
                }
                
                .products-table th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                  text-align: center;
                  font-size: 9px;
                }
                
                .products-table .text-right {
                  text-align: right;
                }
                
                .products-table .text-center {
                  text-align: center;
                }
                
                .products-table tbody tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                
                .products-table tfoot td {
                  font-weight: bold;
                  background-color: #e0e0e0;
                }
                
                .tax-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  font-size: 11px;
                }
                
                .tax-item {
                  margin-bottom: 8px;
                }
                
                .tax-label {
                  font-weight: 600;
                  color: #333;
                  margin-bottom: 2px;
                }
                
                .tax-value {
                  color: #000;
                  font-weight: 500;
                }
                
                @media print {
                  body { margin: 0; padding: 15px; }
                  .invoice-number { font-size: 16px; }
                  .products-table { font-size: 9px; }
                  .products-table th,
                  .products-table td { padding: 2px 4px; }
                  .fbr-logo {
                    width: 70px !important;
                    height: 70px !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    display: flex !important;
                  }
                  .fbr-logo img {
                    width: 60px !important;
                    height: 60px !important;
                    display: block !important;
                  }
                  .qr-code {
                    width: 70px !important;
                    height: 70px !important;
                    position: absolute !important;
                    top: 0 !important;
                    right: 0 !important;
                    display: flex !important;
                    z-index: 10 !important;
                  }
                  .qr-code img {
                    width: 60px !important;
                    height: 60px !important;
                    display: block !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="invoice-print">
                <!-- Content will be inserted here -->
              </div>
            </body>
          </html>
        `)
        
        // Generate the invoice content
        const totals = {
          amount: parseFloat(invoice.totalAmount) || 0,
          tax: invoice.items.reduce((sum, item) => {
            return sum + (parseFloat(item.salesTaxWithheldAtSource) || 0) + (parseFloat(item.extraTax) || 0) + (parseFloat(item.furtherTax) || 0)
          }, 0),
          total: parseFloat(invoice.totalAmount) || 0
        }

        const formatCurrency = (amount: number, currency: string) => {
          try {
            return new Intl.NumberFormat('en-PK', {
              style: 'currency',
              currency: currency || 'PKR',
              minimumFractionDigits: 0,
            }).format(amount)
          } catch {
            return `${amount.toFixed(0)} ${currency || 'PKR'}`
          }
        }

        // Generate the HTML content
        const invoiceContent = `
          <!-- Invoice Header -->
          <div class="invoice-header">
            <!-- FBR Logo -->
            <div class="fbr-logo">
              ${logoDataUrl ? `<img src="${logoDataUrl}" alt="FBR Pakistan Logo" />` : `
                <div style="text-align: center; font-size: 10px; font-weight: bold; color: #1e40af;">
                  FBR<br/>PAKISTAN
                </div>
              `}
            </div>
            
            <!-- QR Code -->
            <div class="qr-code">
              ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" />` : `
                <div style="text-align: center; font-size: 8px; font-weight: bold;">
                  QR: ${qrValue}
                </div>
              `}
            </div>
            
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">Invoice No: ${invoice.invoiceRefNo}</div>
            <div class="invoice-number">FBR Invoice No: ${invoice.fbrInvoiceNumber || 'N/A'}</div>
            <div class="invoice-date">Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
          </div>

          <!-- Seller Details -->
          <div class="section">
            <div class="section-title">Seller Details</div>
            <div class="details-grid">
              <div>
                <div class="detail-item">
                  <div class="detail-label">Business Name</div>
                  <div class="detail-value">${invoice.seller.businessName}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Address</div>
                  <div class="detail-value">
                    ${invoice.seller.address1}
                    ${invoice.seller.address2 ? `, ${invoice.seller.address2}` : ''}
                    ${invoice.seller.city ? `, ${invoice.seller.city}` : ''}
                    ${invoice.seller.postalCode ? ` ${invoice.seller.postalCode}` : ''}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Business Nature</div>
                  <div class="detail-value">${invoice.seller.businessNature?.businessNature || ''}</div>
                </div>
              </div>
              <div>
                <div class="detail-item">
                  <div class="detail-label">NTN / CNIC</div>
                  <div class="detail-value">${invoice.seller.ntnCnic}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Contact</div>
                  <div class="detail-value">
                    ${invoice.seller.businessEmail}
                    ${invoice.seller.businessPhone ? ` / ${invoice.seller.businessPhone}` : ''}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Industry</div>
                  <div class="detail-value">${invoice.seller.industry?.industryName || ''}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Buyer Details -->
          <div class="section">
            <div class="section-title">Buyer Details</div>
            <div class="details-grid">
              <div>
                <div class="detail-item">
                  <div class="detail-label">Business Name</div>
                  <div class="detail-value">${invoice.buyerBusinessName}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Address</div>
                  <div class="detail-value">${invoice.buyerAddress}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Registration Type</div>
                  <div class="detail-value">${invoice.buyerRegistrationType}</div>
                </div>
              </div>
              <div>
                <div class="detail-item">
                  <div class="detail-label">NTN / CNIC</div>
                  <div class="detail-value">${invoice.buyerNTNCNIC}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Province</div>
                  <div class="detail-value">${invoice.buyerProvince}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Products List Details -->
          <div class="section">
            <div class="section-title">Products List Details</div>
            <table class="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>HS Code</th>
                  <th class="text-right">Rate</th>
                  <th class="text-center">UoM</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Sales Excl. ST</th>
                  <th class="text-right">Fixed Value</th>
                  <th class="text-center">Tax App</th>
                  <th class="text-right">Sales Tax</th>
                  <th class="text-right">Extra Tax</th>
                  <th class="text-right">Further Tax</th>
                  <th class="text-center">SRO</th>
                  <th class="text-right">FED</th>
                  <th class="text-right">Discount</th>
                  <th>Sale Type</th>
                  <th class="text-center">SRO Serial</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items?.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.productDescription}</td>
                    <td>${item.hsCode || '—'}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.rate), 'PKR')}</td>
                    <td class="text-center">${item.uoM}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.totalValues), 'PKR')}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.valueSalesExcludingST), 'PKR')}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.fixedNotifiedValueOrRetailPrice), 'PKR')}</td>
                    <td class="text-center">${item.salesTaxApplicable}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.salesTaxWithheldAtSource), 'PKR')}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.extraTax), 'PKR')}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.furtherTax), 'PKR')}</td>
                    <td class="text-center">${item.sroScheduleNo}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.fedPayable), 'PKR')}</td>
                    <td class="text-right">${formatCurrency(parseFloat(item.discount), 'PKR')}</td>
                    <td>${item.saleType}</td>
                    <td class="text-center">${item.sroItemSerialNo}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right">Totals</td>
                  <td class="text-right">${formatCurrency(totals.total, 'PKR')}</td>
                  <td class="text-right">${formatCurrency(totals.amount, 'PKR')}</td>
                  <td class="text-right">${formatCurrency(totals.amount, 'PKR')}</td>
                  <td class="text-center">—</td>
                  <td class="text-right">${formatCurrency(totals.tax, 'PKR')}</td>
                  <td class="text-right">${formatCurrency(totals.tax, 'PKR')}</td>
                  <td class="text-right">${formatCurrency(totals.tax, 'PKR')}</td>
                  <td class="text-center">—</td>
                  <td class="text-right">${formatCurrency(0, 'PKR')}</td>
                  <td class="text-right">${formatCurrency(0, 'PKR')}</td>
                  <td class="text-center">—</td>
                  <td class="text-center">—</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Tax Details -->
          <div class="section">
            <div class="section-title">Tax Details (FBR Pakistan)</div>
            <div class="tax-grid">
              <div>
                <div class="tax-item">
                  <div class="tax-label">Net Amount</div>
                  <div class="tax-value">${formatCurrency(totals.amount, 'PKR')}</div>
                </div>
                <div class="tax-item">
                  <div class="tax-label">FBR Status</div>
                  <div class="tax-value">${invoice.status}</div>
                </div>
                <div class="tax-item">
                  <div class="tax-label">FBR Invoice Number</div>
                  <div class="tax-value">${invoice.fbrInvoiceNumber || 'N/A'}</div>
                </div>
              </div>
              <div>
                <div class="tax-item">
                  <div class="tax-label">Tax Amount</div>
                  <div class="tax-value">${formatCurrency(totals.tax, 'PKR')}</div>
                </div>
                <div class="tax-item">
                  <div class="tax-label">Total Amount</div>
                  <div class="tax-value">${formatCurrency(totals.total, 'PKR')}</div>
                </div>
              </div>
            </div>
          </div>
        `

        // Insert the content
        const printElement = printWindow.document.querySelector('.invoice-print')
        if (printElement) {
          printElement.innerHTML = invoiceContent
        }
        
        // Focus and print
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500) // Reduced timeout since QR code is already generated
      }
    }
  }

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get authorization token from localStorage
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
            setInvoice(data.data);
            setLayout(loadLayoutConfig(data.data.sellerId?.toString()));
            setVisibility(loadFieldVisibility(data.data.sellerId?.toString()));
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

    fetchInvoice();
  }, [params.id])

  const totals = useMemo(() => {
    if (!invoice) return { 
      totalValues: 0, salesExcludingST: 0, fixedValue: 0, salesTax: 0, 
      extraTax: 0, furtherTax: 0, fedPayable: 0, discount: 0, 
      totalTax: 0, total: 0 
    }
    
    const totalValues = invoice.items.reduce((sum, item) => sum + (parseFloat(item.totalValues) || 0), 0)
    const salesExcludingST = invoice.items.reduce((sum, item) => sum + (parseFloat(item.valueSalesExcludingST) || 0), 0)
    const fixedValue = invoice.items.reduce((sum, item) => sum + (parseFloat(item.fixedNotifiedValueOrRetailPrice) || 0), 0)
    const salesTax = invoice.items.reduce((sum, item) => sum + (parseFloat(item.salesTaxWithheldAtSource) || 0), 0)
    const extraTax = invoice.items.reduce((sum, item) => sum + (parseFloat(item.extraTax) || 0), 0)
    const furtherTax = invoice.items.reduce((sum, item) => sum + (parseFloat(item.furtherTax) || 0), 0)
    const fedPayable = invoice.items.reduce((sum, item) => sum + (parseFloat(item.fedPayable) || 0), 0)
    const discount = invoice.items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0)
    const totalTax = salesTax + extraTax + furtherTax
    const total = parseFloat(invoice.totalAmount) || 0
    
    return { 
      totalValues, salesExcludingST, fixedValue, salesTax, 
      extraTax, furtherTax, fedPayable, discount, totalTax, total 
    }
  }, [invoice])

  function moveSection(index: number, direction: -1 | 1) {
    setLayout(prev => {
      const next = [...prev]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= next.length) return prev
      const [spliced] = next.splice(index, 1)
      next.splice(newIndex, 0, spliced)
      saveLayoutConfig(invoice?.sellerId?.toString(), next)
      return next
    })
  }

  function renderSellerContent() {
    if (!invoice?.seller) return null
    
    return (
      <>
        <h2 className="text-base font-semibold mb-1">Seller details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {visibility.sellerName && (
            <div>
              <div className="text-gray-500">Business Name</div>
              <div className="text-gray-900">{invoice.seller.businessName || '—'}</div>
            </div>
          )}
          {visibility.sellerNtnStrn && (
            <div>
              <div className="text-gray-500">NTN / CNIC</div>
              <div className="text-gray-900">{invoice.seller.ntnCnic || '—'}</div>
            </div>
          )}
          {visibility.sellerAddress && (
            <div>
              <div className="text-gray-500">Address</div>
              <div className="text-gray-900">
                {invoice.seller.address1 || '—'}
                {invoice.seller.address2 && `, ${invoice.seller.address2}`}
                {invoice.seller.city && `, ${invoice.seller.city}`}
                {invoice.seller.postalCode && ` ${invoice.seller.postalCode}`}
              </div>
            </div>
          )}
          {visibility.sellerContact && (
            <div>
              <div className="text-gray-500">Contact</div>
              <div className="text-gray-900">
                {invoice.seller.businessEmail || '—'}
                {invoice.seller.businessPhone && ` / ${invoice.seller.businessPhone}`}
              </div>
            </div>
          )}
          <div>
            <div className="text-gray-500">Business Nature</div>
            <div className="text-gray-900">{invoice.seller.businessNature?.businessNature || '—'}</div>
          </div>
          <div>
            <div className="text-gray-500">Industry</div>
            <div className="text-gray-900">{invoice.seller.industry?.industryName || '—'}</div>
          </div>
        </div>
      </>
    )
  }

  function renderBuyerContent() {
    if (!invoice) return null
    
    return (
      <>
        <h2 className="text-base font-semibold mb-1">Buyer details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {visibility.buyerName && (
            <div>
              <div className="text-gray-500">Business Name</div>
              <div className="text-gray-900">{invoice.buyerBusinessName || '—'}</div>
            </div>
          )}
          {visibility.buyerNtnCnic && (
            <div>
              <div className="text-gray-500">NTN / CNIC</div>
              <div className="text-gray-900">{invoice.buyerNTNCNIC || '—'}</div>
            </div>
          )}
          {visibility.buyerAddress && (
            <div>
              <div className="text-gray-500">Address</div>
              <div className="text-gray-900">{invoice.buyerAddress || '—'}</div>
            </div>
          )}
          <div>
            <div className="text-gray-500">Province</div>
            <div className="text-gray-900">{invoice.buyerProvince || '—'}</div>
          </div>
          <div>
            <div className="text-gray-500">Registration Type</div>
            <div className="text-gray-900">{invoice.buyerRegistrationType || '—'}</div>
          </div>
        </div>
      </>
    )
  }

  function renderErrors() {
    if (!invoice) return null
    
    const hasMainError = invoice.error && invoice.error.trim() !== ''
    const itemsWithErrors = invoice.items.filter(item => item.error && item.error.trim() !== '')
    
    if (!hasMainError && itemsWithErrors.length === 0) return null
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-base font-semibold text-red-800 mb-3">Errors & Validation Issues</h2>
        
        {/* Main Invoice Error */}
        {hasMainError && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-red-700 mb-2">Invoice Level Error:</h3>
            <div className="bg-red-100 border border-red-300 rounded p-3">
              <p className="text-sm text-red-600">{invoice.error}</p>
            </div>
          </div>
        )}
        
        {/* Item Level Errors */}
        {itemsWithErrors.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-red-700 mb-2">Item Level Errors:</h3>
            <div className="space-y-3">
              {itemsWithErrors.map((item) => (
                <div key={item.id} className="bg-red-100 border border-red-300 rounded p-3">
                  <div className="text-sm font-medium text-red-800 mb-1">
                    Item: {item.productDescription}
                  </div>
                  <p className="text-sm text-red-600">{item.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600">{error}</div>
        <Link href="/dashboard/invoices" className="text-blue-600 underline">Back to Invoices</Link>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <div className="text-gray-600">Invoice not found.</div>
        <Link href="/dashboard/invoices" className="text-blue-600 underline">Back to Invoices</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceRefNo}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Status: {invoice.status} | Type: {invoice.invoiceType} | Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
          </p>
          {invoice.fbrInvoiceNumber && (
            <p className="mt-1 text-sm text-green-600">FBR Invoice: {invoice.fbrInvoiceNumber}</p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 space-x-3 no-print">
          {isSeller && (invoice.status === 'Pending' || invoice.status === 'Invalid') && (
            <Link
              href={`/dashboard/invoices/${invoice.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Edit this invoice (only available for sellers and pending/invalid invoices)"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Invoice
            </Link>
          )}
          {isSeller && (invoice.status === 'valid' || invoice.status === 'pending') && (
            <button
              onClick={handlePostInvoice}
              disabled={isPosting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isPosting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              title={isPosting ? "Posting to FBR..." : "Post this invoice to FBR (only available for sellers and valid/pending invoices)"}
            >
              {isPosting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              )}
              {isPosting ? 'Posting...' : 'Post to FBR'}
            </button>
          )}
          {isSeller && isSubmitted && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Print this invoice (only available for sellers and submitted invoices)"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Invoice
            </button>
          )}
          <Link href="/dashboard/invoices" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Back</Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between no-print">
          <div className="text-sm text-gray-700">Reorder sections (saved per seller)</div>
          <div className="flex items-center gap-2">
            {layout.map((key, idx) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-xs text-gray-600">{key}</span>
                <button className="px-1 py-0.5 text-xs border rounded disabled:opacity-50" onClick={() => moveSection(idx, -1)} disabled={idx === 0}>↑</button>
                <button className="px-1 py-0.5 text-xs border rounded disabled:opacity-50" onClick={() => moveSection(idx, 1)} disabled={idx === layout.length - 1}>↓</button>
              </div>
            ))}
            <button className="ml-4 px-2 py-1 text-xs border rounded" onClick={() => setShowCustomizer(v => !v)}>{showCustomizer ? 'Hide' : 'Customize fields'}</button>
          </div>
        </div>
        {showCustomizer && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 no-print">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-800">
              <div>
                <div className="font-semibold mb-1">Seller</div>
                {[
                  ['sellerName','Name'],
                  ['sellerNtnStrn','NTN / STRN'],
                  ['sellerAddress','Address'],
                  ['sellerContact','Contact'],
                ].map(([key,label]) => (
                  <label key={key} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.sellerId?.toString(),next) }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <div className="font-semibold mb-1">Buyer</div>
                {[
                  ['buyerName','Name'],
                  ['buyerNtnCnic','NTN / CNIC'],
                  ['buyerAddress','Address'],
                  ['buyerContact','Contact'],
                ].map(([key,label]) => (
                  <label key={key} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.sellerId?.toString(),next) }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <div className="font-semibold mb-1">Tax details</div>
                {[
                  ['taxNetAmount','Net Amount'],
                  ['taxTaxAmount','Tax Amount'],
                  ['taxTotalAmount','Total Amount'],
                  ['taxFbrStatus','FBR Status'],
                  ['taxIrn','IRN'],
                ].map(([key,label]) => (
                  <label key={key} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.sellerId?.toString(),next) }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Errors Section */}
          {renderErrors()}
          
          {(() => {
            const blocks: JSX.Element[] = []
            for (let i = 0; i < layout.length; i++) {
              const section = layout[i]
              const next = layout[i + 1]

              if ((section === 'seller' && next === 'buyer') || (section === 'buyer' && next === 'seller')) {
                blocks.push(
                  <div key={`seller-buyer-${i}`} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <section className="md:col-span-6">
                      {section === 'seller' ? renderSellerContent() : renderBuyerContent()}
                    </section>
                    <section className="md:col-span-6">
                      {next === 'buyer' ? renderBuyerContent() : renderSellerContent()}
                    </section>
                  </div>
                )
                i++
                continue
              }

              if (section === 'seller') {
                blocks.push(
                  <section key={`seller-${i}`}>
                    {renderSellerContent()}
                  </section>
                )
                continue
              }


              if (section === 'buyer') {
                blocks.push(
                  <section key={`buyer-${i}`}>
                    {renderBuyerContent()}
                  </section>
                )
                continue
              }

              if (section === 'products') {
                blocks.push(
                  <section key={`products-${i}`}>
                    <h2 className="text-lg font-semibold mb-1">Products list details</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-600 uppercase tracking-wide">Description</th>
                            <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-600 uppercase tracking-wide">HS Code</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Rate</th>
                            <th className="px-2 py-1 text-center text-[11px] font-medium text-gray-600 uppercase tracking-wide">UoM</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Quantity</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Total Values</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Sales Excl. ST</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Fixed Notified Value Or Retail Price</th>
                            <th className="px-2 py-1 text-center text-[11px] font-medium text-gray-600 uppercase tracking-wide">Sales Tax Applicable</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Sales Tax</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Extra Tax</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Further Tax</th>
                            <th className="px-2 py-1 text-center text-[11px] font-medium text-gray-600 uppercase tracking-wide">SRO Schedule</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">FED Payable</th>
                            <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Discount</th>
                            <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-600 uppercase tracking-wide">Sale Type</th>
                            <th className="px-2 py-1 text-center text-[11px] font-medium text-gray-600 uppercase tracking-wide">SRO Item Serial</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoice.items?.map(item => {
                            const itemHasError = item.error && item.error.trim() !== ''
                            return (
                            <tr key={item.id.toString()} className={itemHasError ? 'bg-red-50' : ''}>
                              <td className="px-2 py-1 text-gray-900">
                                {item.productDescription}
                                {itemHasError && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      ⚠️ Error
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-1 text-gray-700">{item.hsCode || '—'}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.rate), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-center">{item.uoM}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{item.quantity}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.totalValues), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.valueSalesExcludingST), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.fixedNotifiedValueOrRetailPrice), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-center">
                                {item.salesTaxApplicable}
                              </td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.salesTaxWithheldAtSource), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.extraTax), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.furtherTax), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-center">{item.sroScheduleNo}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.fedPayable), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(parseFloat(item.discount), 'PKR')}</td>
                              <td className="px-2 py-1 text-gray-700">{item.saleType}</td>
                              <td className="px-2 py-1 text-gray-700 text-center">{item.sroItemSerialNo}</td>
                            </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 text-[11px]">
                          <tr>
                            <td className="px-2 py-1 font-medium text-gray-900" colSpan={5}>
                              Totals
                            </td>
                            <td className="px-2 py-1 font-bold text-right text-gray-900">{formatCurrency(totals.totalValues, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.salesExcludingST, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.fixedValue, 'PKR')}</td>
                            <td className="px-2 py-1 text-center text-gray-900">—</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.salesTax, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.extraTax, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.furtherTax, 'PKR')}</td>
                            <td className="px-2 py-1 text-center text-gray-900">—</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.fedPayable, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.discount, 'PKR')}</td>
                            <td className="px-2 py-1 text-center text-gray-900">—</td>
                            <td className="px-2 py-1 text-center text-gray-900">—</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </section>
                )
                continue
              }

              if (section === 'tax') {
                blocks.push(
                  <div key={`tax-${i}`} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <section className="md:col-span-6">
                      <h2 className="text-base font-semibold mb-1">Tax details (FBR Pakistan)</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Net Amount</div>
                          <div className="text-gray-900">{formatCurrency(totals.salesExcludingST, 'PKR')}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Tax</div>
                          <div className="text-gray-900">{formatCurrency(totals.totalTax, 'PKR')}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Amount</div>
                          <div className="text-gray-900">{formatCurrency(totals.total, 'PKR')}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">FBR Status</div>
                          <div className="text-gray-900">{invoice.status}</div>
                        </div>
                        {invoice.fbrInvoiceNumber && (
                          <div className="sm:col-span-2">
                            <div className="text-gray-500">FBR Invoice Number</div>
                            <div className="text-gray-900 break-all">{invoice.fbrInvoiceNumber}</div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                )
                continue
              }
            }
            return blocks
          })()}
        </div>
      </div>

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
                <div className={`text-sm ${modalType === 'success' ? 'text-gray-500' : 'text-red-500'} whitespace-pre-line`}>
                  {modalMessage}
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleModalClose}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                    modalType === 'success' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {modalType === 'success' ? 'Continue' : 'Try Again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


