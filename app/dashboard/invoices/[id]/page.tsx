'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type InvoiceItem = {
  id: string
  description: string
  hsCode?: string | null
  quantity: number
  unitPrice: number
  taxAmount: number
  totalAmount: number
  taxPercentage?: number
}

type FbrResponse = {
  irn?: string
  qrCode?: string
  statusCode?: number
  errorMessage?: string | null
}

type Invoice = {
  id: string
  tenantId: string
  invoiceNo: string
  customerName: string
  customerNtn?: string | null
  customerCnic?: string | null
  customerAddress?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  status: string
  amount: number
  taxAmount: number
  totalAmount: number
  invoiceDate: string
  dueDate?: string | null
  currency: string
  items: InvoiceItem[]
  fbrResponse?: FbrResponse | null
}

type Tenant = {
  id: string
  name: string
  ntn?: string
  strn?: string
  businessAddress?: string
  businessEmail?: string
  businessPhone?: string
  environment?: string
  bankName?: string
  accountTitle?: string
  accountNumber?: string
  iban?: string
  branch?: string
  swiftCode?: string
  bankAddress?: string
}

type SectionKey = 'seller' | 'buyer' | 'products' | 'bank' | 'tax'

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
  // Bank
  bankName: boolean
  bankAccountTitle: boolean
  bankAccountNumber: boolean
  bankIban: boolean
  bankBranch: boolean
  bankSwift: boolean
  bankAddress: boolean
  // Products columns
  productsDescription: boolean
  productsHsCode: boolean
  productsQty: boolean
  productsUnitPrice: boolean
  productsTax: boolean
  productsTotal: boolean
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

function loadLayoutConfig(tenantId: string | undefined): SectionKey[] {
  if (!tenantId || typeof window === 'undefined') return ['seller', 'buyer', 'products', 'bank', 'tax']
  try {
    const stored = localStorage.getItem(`invoice_view_layout_${tenantId}`)
    if (!stored) return ['seller', 'buyer', 'products', 'bank', 'tax']
    const parsed = JSON.parse(stored) as SectionKey[]
    const defaults: SectionKey[] = ['seller', 'buyer', 'products', 'bank', 'tax']
    const unique = Array.from(new Set(parsed.filter((k): k is SectionKey => defaults.includes(k))))
    // Ensure all defaults exist exactly once
    const missing = defaults.filter(k => !unique.includes(k))
    return [...unique, ...missing]
  } catch {
    return ['seller', 'buyer', 'products', 'bank', 'tax']
  }
}

function saveLayoutConfig(tenantId: string | undefined, layout: SectionKey[]) {
  if (!tenantId || typeof window === 'undefined') return
  localStorage.setItem(`invoice_view_layout_${tenantId}`, JSON.stringify(layout))
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
    bankName: true,
    bankAccountTitle: true,
    bankAccountNumber: true,
    bankIban: true,
    bankBranch: true,
    bankSwift: true,
    bankAddress: true,
    productsDescription: true,
    productsHsCode: true,
    productsQty: true,
    productsUnitPrice: true,
    productsTax: true,
    productsTotal: true,
    taxNetAmount: true,
    taxTaxAmount: true,
    taxTotalAmount: true,
    taxFbrStatus: true,
    taxIrn: true,
  }
}

function loadFieldVisibility(tenantId: string | undefined): FieldVisibility {
  if (!tenantId || typeof window === 'undefined') {
    return defaultFieldVisibility()
  }
  try {
    const stored = localStorage.getItem(`invoice_view_fields_${tenantId}`)
    if (!stored) return defaultFieldVisibility()
    const parsed = JSON.parse(stored) as Partial<FieldVisibility>
    return { ...defaultFieldVisibility(), ...parsed }
  } catch {
    return defaultFieldVisibility()
  }
}

function saveFieldVisibility(tenantId: string | undefined, vis: FieldVisibility) {
  if (!tenantId || typeof window === 'undefined') return
  localStorage.setItem(`invoice_view_fields_${tenantId}`, JSON.stringify(vis))
}

export default function InvoiceViewPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [layout, setLayout] = useState<SectionKey[]>(['seller', 'buyer', 'products', 'tax'])
  const [visibility, setVisibility] = useState<FieldVisibility>(defaultFieldVisibility())
  const [showCustomizer, setShowCustomizer] = useState(false)

  useEffect(() => {
    // Use dummy data (no API calls)
    setIsLoading(true)
    setError(null)

    const dummyTenant: Tenant = {
      id: 'tenant-1',
      name: 'Demo Company Pvt Ltd',
      ntn: '1234567-8',
      strn: '77-123-4567-890',
      businessAddress: '1st Floor, Business Center, Karachi',
      businessEmail: 'info@demo-company.pk',
      businessPhone: '+92 21 111 000 000',
      environment: 'sandbox',
      bankName: 'Bank Al Habib',
      accountTitle: 'Demo Company Pvt Ltd',
      accountNumber: '0012345678901',
      iban: 'PK36ABPA0012345678901234',
      branch: 'Clifton Branch',
      swiftCode: 'BMAHPPKH',
      bankAddress: 'Clifton Block 5, Karachi',
    }

    const dummyInvoice: Invoice = {
      id: params.id,
      tenantId: dummyTenant.id,
      invoiceNo: 'INV-2025-0012',
      customerName: 'ABC Trading Co.',
      customerNtn: '7654321-0',
      customerCnic: null,
      customerAddress: 'Plot 42, Industrial Area, Lahore',
      customerEmail: 'accounts@abctrading.pk',
      customerPhone: '+92 42 222 1111',
      status: 'issued',
      amount: 50000,
      taxAmount: 9000,
      totalAmount: 59000,
      invoiceDate: new Date().toISOString(),
      dueDate: null,
      currency: 'PKR',
      items: [
        {
          id: 'item-1',
          description: 'Industrial Widget A',
          hsCode: '8479.89',
          quantity: 5,
          unitPrice: 8000,
          taxAmount: 7200 * 0.125,
          totalAmount: 5 * 8000 + 900,
          taxPercentage: 18,
        },
        {
          id: 'item-2',
          description: 'Service - Installation',
          hsCode: '9983.99',
          quantity: 1,
          unitPrice: 10000,
          taxAmount: 1800,
          totalAmount: 11800,
          taxPercentage: 18,
        },
        {
          id: 'item-3',
          description: 'Spare Part X200',
          hsCode: '8481.80',
          quantity: 2,
          unitPrice: 3500,
          taxAmount: 1260,
          totalAmount: 8260,
          taxPercentage: 18,
        },
        {
          id: 'item-4',
          description: 'Calibration Service',
          hsCode: '9987.00',
          quantity: 1,
          unitPrice: 4500,
          taxAmount: 810,
          totalAmount: 5310,
          taxPercentage: 18,
        },
        {
          id: 'item-5',
          description: 'Packaging Material',
          hsCode: '4819.10',
          quantity: 10,
          unitPrice: 200,
          taxAmount: 360,
          totalAmount: 2360,
          taxPercentage: 18,
        },
        {
          id: 'item-6',
          description: 'Custom Bracket',
          hsCode: '7326.90',
          quantity: 3,
          unitPrice: 1500,
          taxAmount: 810,
          totalAmount: 5310,
          taxPercentage: 18,
        },
        {
          id: 'item-7',
          description: 'Cables Set (5m)',
          hsCode: '8544.42',
          quantity: 4,
          unitPrice: 900,
          taxAmount: 648,
          totalAmount: 4248,
          taxPercentage: 18,
        },
        {
          id: 'item-8',
          description: 'Software License (1y)',
          hsCode: '8523.49',
          quantity: 1,
          unitPrice: 12000,
          taxAmount: 2160,
          totalAmount: 14160,
          taxPercentage: 18,
        },
        {
          id: 'item-9',
          description: 'On-site Support Visit',
          hsCode: '9983.19',
          quantity: 1,
          unitPrice: 6000,
          taxAmount: 1080,
          totalAmount: 7080,
          taxPercentage: 18,
        },
        {
          id: 'item-10',
          description: 'Training Session (Half-day)',
          hsCode: '9992.30',
          quantity: 1,
          unitPrice: 3500,
          taxAmount: 630,
          totalAmount: 4130,
          taxPercentage: 18,
        },
        {
          id: 'item-11',
          description: 'Mounting Kit M5',
          hsCode: '7318.15',
          quantity: 6,
          unitPrice: 250,
          taxAmount: 270,
          totalAmount: 1770,
          taxPercentage: 18,
        },
        {
          id: 'item-12',
          description: 'Protective Case',
          hsCode: '4202.99',
          quantity: 2,
          unitPrice: 2200,
          taxAmount: 792,
          totalAmount: 5192,
          taxPercentage: 18,
        },
        {
          id: 'item-13',
          description: 'Sensor Module S10',
          hsCode: '9026.20',
          quantity: 3,
          unitPrice: 4200,
          taxAmount: 2268,
          totalAmount: 14868,
          taxPercentage: 18,
        },
        {
          id: 'item-14',
          description: 'Power Adapter 12V',
          hsCode: '8504.40',
          quantity: 2,
          unitPrice: 1800,
          taxAmount: 648,
          totalAmount: 4248,
          taxPercentage: 18,
        },
        {
          id: 'item-15',
          description: 'Data Cable USB-C',
          hsCode: '8544.42',
          quantity: 5,
          unitPrice: 500,
          taxAmount: 450,
          totalAmount: 2950,
          taxPercentage: 18,
        },
        {
          id: 'item-16',
          description: 'Thermal Paper Roll',
          hsCode: '4811.90',
          quantity: 8,
          unitPrice: 150,
          taxAmount: 216,
          totalAmount: 1416,
          taxPercentage: 18,
        },
        {
          id: 'item-17',
          description: 'Firmware Update Service',
          hsCode: '9983.19',
          quantity: 1,
          unitPrice: 3000,
          taxAmount: 540,
          totalAmount: 3540,
          taxPercentage: 18,
        },
        {
          id: 'item-18',
          description: 'Extended Warranty (1y)',
          hsCode: '9991.99',
          quantity: 1,
          unitPrice: 4500,
          taxAmount: 810,
          totalAmount: 5310,
          taxPercentage: 18,
        },
        {
          id: 'item-19',
          description: 'Rack Mount Rail Set',
          hsCode: '7326.90',
          quantity: 2,
          unitPrice: 2600,
          taxAmount: 936,
          totalAmount: 6136,
          taxPercentage: 18,
        },
        {
          id: 'item-20',
          description: 'Labeling Service',
          hsCode: '9988.99',
          quantity: 1,
          unitPrice: 1200,
          taxAmount: 216,
          totalAmount: 1416,
          taxPercentage: 18,
        },
      ],
      fbrResponse: {
        irn: 'FBR-IRN-1234567890',
        qrCode: undefined,
        statusCode: 200,
        errorMessage: null,
      },
    }

    setTenant(dummyTenant)
    setInvoice(dummyInvoice)
    setLayout(loadLayoutConfig(dummyInvoice.tenantId))
    setVisibility(loadFieldVisibility(dummyInvoice.tenantId))
    setIsLoading(false)
  }, [params.id])

  const totals = useMemo(() => {
    if (!invoice) return { amount: 0, tax: 0, total: 0 }
    const amount = invoice.amount ?? 0
    const tax = invoice.taxAmount ?? 0
    const total = invoice.totalAmount ?? amount + tax
    return { amount, tax, total }
  }, [invoice])

  function moveSection(index: number, direction: -1 | 1) {
    setLayout(prev => {
      const next = [...prev]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= next.length) return prev
      const [spliced] = next.splice(index, 1)
      next.splice(newIndex, 0, spliced)
      saveLayoutConfig(invoice?.tenantId, next)
      return next
    })
  }

  function renderSellerContent() {
    return (
      <>
        <h2 className="text-base font-semibold mb-1">Seller details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {visibility.sellerName && (
            <div>
              <div className="text-gray-500">Name</div>
              <div className="text-gray-900">{tenant?.name || '—'}</div>
            </div>
          )}
          {visibility.sellerNtnStrn && (
            <div>
              <div className="text-gray-500">NTN / STRN</div>
              <div className="text-gray-900">{tenant?.ntn || '—'}{tenant?.strn ? ` / ${tenant.strn}` : ''}</div>
            </div>
          )}
          {visibility.sellerAddress && (
            <div>
              <div className="text-gray-500">Address</div>
              <div className="text-gray-900">{tenant?.businessAddress || '—'}</div>
            </div>
          )}
          {visibility.sellerContact && (
            <div>
              <div className="text-gray-500">Contact</div>
              <div className="text-gray-900">{tenant?.businessEmail || '—'}{tenant?.businessPhone ? ` / ${tenant.businessPhone}` : ''}</div>
            </div>
          )}
        </div>
      </>
    )
  }

  function renderBuyerContent() {
    return (
      <>
        <h2 className="text-base font-semibold mb-1">Buyer details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {visibility.buyerName && (
            <div>
              <div className="text-gray-500">Name</div>
              <div className="text-gray-900">{invoice?.customerName || '—'}</div>
            </div>
          )}
          {visibility.buyerNtnCnic && (
            <div>
              <div className="text-gray-500">NTN / CNIC</div>
              <div className="text-gray-900">{invoice?.customerNtn || '—'}{invoice?.customerCnic ? ` / ${invoice.customerCnic}` : ''}</div>
            </div>
          )}
          {visibility.buyerAddress && (
            <div>
              <div className="text-gray-500">Address</div>
              <div className="text-gray-900">{invoice?.customerAddress || '—'}</div>
            </div>
          )}
          {visibility.buyerContact && (
            <div>
              <div className="text-gray-500">Contact</div>
              <div className="text-gray-900">{invoice?.customerEmail || '—'}{invoice?.customerPhone ? ` / ${invoice.customerPhone}` : ''}</div>
            </div>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNo}</h1>
          <p className="mt-2 text-sm text-gray-700">Status: {invoice.status}</p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-3">
          <Link href="/dashboard/invoices" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Back</Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">Reorder sections (saved per tenant)</div>
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
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.tenantId,next) }} />
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
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.tenantId,next) }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <div className="font-semibold mb-1">Bank</div>
                {[
                  ['bankName','Bank'],
                  ['bankAccountTitle','Account Title'],
                  ['bankAccountNumber','Account Number'],
                  ['bankIban','IBAN'],
                  ['bankBranch','Branch'],
                  ['bankSwift','SWIFT'],
                  ['bankAddress','Bank Address'],
                ].map(([key,label]) => (
                  <label key={key} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.tenantId,next) }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <div className="font-semibold mb-1">Products columns</div>
                {[
                  ['productsDescription','Description'],
                  ['productsHsCode','HS Code'],
                  ['productsQty','Qty'],
                  ['productsUnitPrice','Unit Price'],
                  ['productsTax','Tax'],
                  ['productsTotal','Total'],
                ].map(([key,label]) => (
                  <label key={key} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.tenantId,next) }} />
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
                    <input type="checkbox" checked={(visibility as any)[key]} onChange={(e)=>{ const next={...visibility,[key as keyof FieldVisibility]: e.target.checked} as FieldVisibility; setVisibility(next); saveFieldVisibility(invoice?.tenantId,next) }} />
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

              if ((section === 'bank' && next === 'tax') || (section === 'tax' && next === 'bank')) {
                blocks.push(
                  <div key={`bank-tax-${i}`} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <section className="md:col-span-6">
                      {section === 'bank' ? (
                        <>
                          <h2 className="text-base font-semibold mb-1">Bank account details</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {visibility.bankName && (
                              <div>
                                <div className="text-gray-500">Bank</div>
                                <div className="text-gray-900">{tenant?.bankName || '—'}</div>
                              </div>
                            )}
                            {visibility.bankAccountTitle && (
                              <div>
                                <div className="text-gray-500">Account Title</div>
                                <div className="text-gray-900">{tenant?.accountTitle || '—'}</div>
                              </div>
                            )}
                            {visibility.bankAccountNumber && (
                              <div>
                                <div className="text-gray-500">Account Number</div>
                                <div className="text-gray-900">{tenant?.accountNumber || '—'}</div>
                              </div>
                            )}
                            {visibility.bankIban && (
                              <div>
                                <div className="text-gray-500">IBAN</div>
                                <div className="text-gray-900 break-all">{tenant?.iban || '—'}</div>
                              </div>
                            )}
                            {visibility.bankBranch && (
                              <div>
                                <div className="text-gray-500">Branch</div>
                                <div className="text-gray-900">{tenant?.branch || '—'}</div>
                              </div>
                            )}
                            {visibility.bankSwift && (
                              <div>
                                <div className="text-gray-500">SWIFT</div>
                                <div className="text-gray-900">{tenant?.swiftCode || '—'}</div>
                              </div>
                            )}
                            {visibility.bankAddress && (
                              <div className="sm:col-span-2">
                                <div className="text-gray-500">Bank Address</div>
                                <div className="text-gray-900">{tenant?.bankAddress || '—'}</div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-base font-semibold mb-1">Tax details (FBR Pakistan)</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {visibility.taxNetAmount && (
                              <div>
                                <div className="text-gray-500">Net Amount</div>
                                <div className="text-gray-900">{formatCurrency(totals.amount, invoice.currency)}</div>
                              </div>
                            )}
                            {visibility.taxTaxAmount && (
                              <div>
                                <div className="text-gray-500">Tax Amount</div>
                                <div className="text-gray-900">{formatCurrency(totals.tax, invoice.currency)}</div>
                              </div>
                            )}
                            {visibility.taxTotalAmount && (
                              <div>
                                <div className="text-gray-500">Total Amount</div>
                                <div className="text-gray-900">{formatCurrency(totals.total, invoice.currency)}</div>
                              </div>
                            )}
                            {visibility.taxFbrStatus && (
                              <div>
                                <div className="text-gray-500">FBR Status</div>
                                <div className="text-gray-900">{invoice.fbrResponse?.irn ? 'Issued' : invoice.status === 'failed' ? 'Failed' : 'Pending'}</div>
                              </div>
                            )}
                            {visibility.taxIrn && invoice.fbrResponse?.irn && (
                              <div className="sm:col-span-2">
                                <div className="text-gray-500">IRN</div>
                                <div className="text-gray-900 break-all">{invoice.fbrResponse.irn}</div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </section>
                    <section className="md:col-span-6">
                      {next === 'tax' ? (
                        <>
                          <h2 className="text-base font-semibold mb-1">Tax details (FBR Pakistan)</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {visibility.taxNetAmount && (
                              <div>
                                <div className="text-gray-500">Net Amount</div>
                                <div className="text-gray-900">{formatCurrency(totals.amount, invoice.currency)}</div>
                              </div>
                            )}
                            {visibility.taxTaxAmount && (
                              <div>
                                <div className="text-gray-500">Tax Amount</div>
                                <div className="text-gray-900">{formatCurrency(totals.tax, invoice.currency)}</div>
                              </div>
                            )}
                            {visibility.taxTotalAmount && (
                              <div>
                                <div className="text-gray-500">Total Amount</div>
                                <div className="text-gray-900">{formatCurrency(totals.total, invoice.currency)}</div>
                              </div>
                            )}
                            {visibility.taxFbrStatus && (
                              <div>
                                <div className="text-gray-500">FBR Status</div>
                                <div className="text-gray-900">{invoice.fbrResponse?.irn ? 'Issued' : invoice.status === 'failed' ? 'Failed' : 'Pending'}</div>
                              </div>
                            )}
                            {visibility.taxIrn && invoice.fbrResponse?.irn && (
                              <div className="sm:col-span-2">
                                <div className="text-gray-500">IRN</div>
                                <div className="text-gray-900 break-all">{invoice.fbrResponse.irn}</div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-base font-semibold mb-1">Bank account details</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-gray-500">Bank</div>
                              <div className="text-gray-900">{tenant?.bankName || '—'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Account Title</div>
                              <div className="text-gray-900">{tenant?.accountTitle || '—'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Account Number</div>
                              <div className="text-gray-900">{tenant?.accountNumber || '—'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">IBAN</div>
                              <div className="text-gray-900 break-all">{tenant?.iban || '—'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Branch</div>
                              <div className="text-gray-900">{tenant?.branch || '—'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">SWIFT</div>
                              <div className="text-gray-900">{tenant?.swiftCode || '—'}</div>
                            </div>
                            {visibility.bankAddress && (
                              <div className="sm:col-span-2">
                                <div className="text-gray-500">Bank Address</div>
                                <div className="text-gray-900">{tenant?.bankAddress || '—'}</div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </section>
                  </div>
                )
                i++
                continue
              }

              if (section === 'bank') {
                blocks.push(
                  <div key={`bank-${i}`} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <section className="md:col-span-6">
                      <h2 className="text-base font-semibold mb-1">Bank account details</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Bank</div>
                          <div className="text-gray-900">{tenant?.bankName || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Account Title</div>
                          <div className="text-gray-900">{tenant?.accountTitle || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Account Number</div>
                          <div className="text-gray-900">{tenant?.accountNumber || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">IBAN</div>
                          <div className="text-gray-900 break-all">{tenant?.iban || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Branch</div>
                          <div className="text-gray-900">{tenant?.branch || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">SWIFT</div>
                          <div className="text-gray-900">{tenant?.swiftCode || '—'}</div>
                        </div>
                        {visibility.bankAddress && (
                          <div className="sm:col-span-2">
                            <div className="text-gray-500">Bank Address</div>
                            <div className="text-gray-900">{tenant?.bankAddress || '—'}</div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
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
                            {visibility.productsDescription && (
                              <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-600 uppercase tracking-wide">Description</th>
                            )}
                            {visibility.productsHsCode && (
                              <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-600 uppercase tracking-wide">HS Code</th>
                            )}
                            {visibility.productsQty && (
                              <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Qty</th>
                            )}
                            {visibility.productsUnitPrice && (
                              <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Unit Price</th>
                            )}
                            {visibility.productsTax && (
                              <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Tax</th>
                            )}
                            {visibility.productsTotal && (
                              <th className="px-2 py-1 text-right text-[11px] font-medium text-gray-600 uppercase tracking-wide">Total</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoice.items?.map(item => (
                            <tr key={item.id}>
                              {visibility.productsDescription && (
                                <td className="px-2 py-1 text-gray-900">{item.description}</td>
                              )}
                              {visibility.productsHsCode && (
                                <td className="px-2 py-1 text-gray-700">{item.hsCode || '—'}</td>
                              )}
                              {visibility.productsQty && (
                                <td className="px-2 py-1 text-gray-700 text-right">{item.quantity}</td>
                              )}
                              {visibility.productsUnitPrice && (
                                <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                              )}
                              {visibility.productsTax && (
                                <td className="px-2 py-1 text-gray-700 text-right">{formatCurrency(item.taxAmount ?? 0, invoice.currency)}</td>
                              )}
                              {visibility.productsTotal && (
                                <td className="px-2 py-1 text-gray-900 text-right">{formatCurrency(item.totalAmount, invoice.currency)}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 text-[11px]">
                          <tr>
                            <td className="px-2 py-1 font-medium text-gray-900" colSpan={(visibility.productsDescription ? 1 : 0) + (visibility.productsHsCode ? 1 : 0) + (visibility.productsQty ? 1 : 0) + (visibility.productsUnitPrice ? 1 : 0) - (visibility.productsTax ? 0 : 1) - (visibility.productsTotal ? 0 : 1)}>
                              Totals
                            </td>
                            {visibility.productsTax && (
                              <td className="px-2 py-1 font-medium text-right text-gray-900">{formatCurrency(totals.tax, invoice.currency)}</td>
                            )}
                            {visibility.productsTotal && (
                              <td className="px-2 py-1 font-bold text-right text-gray-900">{formatCurrency(totals.total, invoice.currency)}</td>
                            )}
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
                          <div className="text-gray-900">{formatCurrency(totals.amount, invoice.currency)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tax Amount</div>
                          <div className="text-gray-900">{formatCurrency(totals.tax, invoice.currency)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Amount</div>
                          <div className="text-gray-900">{formatCurrency(totals.total, invoice.currency)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">FBR Status</div>
                          <div className="text-gray-900">{invoice.fbrResponse?.irn ? 'Issued' : invoice.status === 'failed' ? 'Failed' : 'Pending'}</div>
                        </div>
                        {invoice.fbrResponse?.irn && (
                          <div className="sm:col-span-2">
                            <div className="text-gray-500">IRN</div>
                            <div className="text-gray-900 break-all">{invoice.fbrResponse.irn}</div>
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


