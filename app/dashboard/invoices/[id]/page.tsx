'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

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
    if (!invoice) return { amount: 0, tax: 0, total: 0 }
    const total = parseFloat(invoice.totalAmount) || 0
    // Calculate tax amount from items
    const taxAmount = invoice.items.reduce((sum, item) => {
      return sum + (parseFloat(item.salesTaxWithheldAtSource) || 0) + (parseFloat(item.extraTax) || 0) + (parseFloat(item.furtherTax) || 0)
    }, 0)
    const amount = total - taxAmount
    return { amount, tax: taxAmount, total }
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
        <div className="mt-4 sm:mt-0 space-x-3">
          <Link href="/dashboard/invoices" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Back</Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
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
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
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
                            <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-600 uppercase tracking-wide">ID</th>
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
                          {invoice.items?.map(item => (
                            <tr key={item.id.toString()}>
                              <td className="px-2 py-1 text-gray-900 font-medium">{item.id}</td>
                              <td className="px-2 py-1 text-gray-900">{item.productDescription}</td>
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
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 text-[11px]">
                          <tr>
                            <td className="px-2 py-1 font-medium text-gray-900" colSpan={6}>
                              Totals
                            </td>
                            <td className="px-2 py-1 font-bold text-right text-gray-900">{formatCurrency(totals.total, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.amount, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.amount, 'PKR')}</td>
                            <td className="px-2 py-1 text-center text-gray-900">—</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.tax, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.tax, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.tax, 'PKR')}</td>
                            <td className="px-2 py-1 text-center text-gray-900">—</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(0, 'PKR')}</td>
                            <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(0, 'PKR')}</td>
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
                          <div className="text-gray-900">{formatCurrency(totals.amount, 'PKR')}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tax Amount</div>
                          <div className="text-gray-900">{formatCurrency(totals.tax, 'PKR')}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Amount</div>
                          <div className="text-gray-900">{formatCurrency(totals.total, 'PKR')}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">FBR Status</div>
                          <div className="text-gray-900">{invoice.fbrInvoiceNumber ? 'Issued' : invoice.status === 'failed' ? 'Failed' : 'Pending'}</div>
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
    </div>
  )
}


