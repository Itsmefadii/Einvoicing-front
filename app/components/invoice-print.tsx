'use client'

import { formatCurrency } from '@/lib/utils'

interface InvoiceItem {
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

interface BusinessNature {
  businessNature: string
}

interface Industry {
  industryName: string
}

interface Seller {
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

interface Invoice {
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

interface InvoicePrintProps {
  invoice: Invoice
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

export default function InvoicePrint({ invoice }: InvoicePrintProps) {
  const totals = {
    amount: parseFloat(invoice.totalAmount) || 0,
    tax: invoice.items.reduce((sum, item) => {
      return sum + (parseFloat(item.salesTaxWithheldAtSource) || 0) + (parseFloat(item.extraTax) || 0) + (parseFloat(item.furtherTax) || 0)
    }, 0),
    total: parseFloat(invoice.totalAmount) || 0
  }

  return (
    <div className="invoice-print">
      <style jsx global>{`
        .invoice-print {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.2;
          color: #000;
          background: white;
          padding: 20px;
          max-width: 100%;
          margin: 0 auto;
        }
        
        .invoice-print * {
          box-sizing: border-box;
        }
        
        .invoice-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
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
          margin-bottom: 5px;
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
          .invoice-print {
            margin: 0;
            padding: 15px;
            font-size: 11px;
          }
          
          .invoice-title {
            font-size: 24px;
          }
          
          .invoice-number {
            font-size: 16px;
          }
          
          .products-table {
            font-size: 9px;
          }
          
          .products-table th,
          .products-table td {
            padding: 2px 4px;
          }
        }
      `}</style>

      {/* Invoice Header */}
      <div className="invoice-header">
        <div className="invoice-title">INVOICE</div>
        <div className="invoice-number">Invoice No: {invoice.invoiceRefNo}</div>
        <div className="invoice-date">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
      </div>

      {/* Seller Details */}
      <div className="section">
        <div className="section-title">Seller Details</div>
        <div className="details-grid">
          <div>
            <div className="detail-item">
              <div className="detail-label">Business Name</div>
              <div className="detail-value">{invoice.seller.businessName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Address</div>
              <div className="detail-value">
                {invoice.seller.address1}
                {invoice.seller.address2 && `, ${invoice.seller.address2}`}
                {invoice.seller.city && `, ${invoice.seller.city}`}
                {invoice.seller.postalCode && ` ${invoice.seller.postalCode}`}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Business Nature</div>
              <div className="detail-value">{invoice.seller.businessNature?.businessNature}</div>
            </div>
          </div>
          <div>
            <div className="detail-item">
              <div className="detail-label">NTN / CNIC</div>
              <div className="detail-value">{invoice.seller.ntnCnic}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Contact</div>
              <div className="detail-value">
                {invoice.seller.businessEmail}
                {invoice.seller.businessPhone && ` / ${invoice.seller.businessPhone}`}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Industry</div>
              <div className="detail-value">{invoice.seller.industry?.industryName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Details */}
      <div className="section">
        <div className="section-title">Buyer Details</div>
        <div className="details-grid">
          <div>
            <div className="detail-item">
              <div className="detail-label">Business Name</div>
              <div className="detail-value">{invoice.buyerBusinessName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Address</div>
              <div className="detail-value">{invoice.buyerAddress}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Registration Type</div>
              <div className="detail-value">{invoice.buyerRegistrationType}</div>
            </div>
          </div>
          <div>
            <div className="detail-item">
              <div className="detail-label">NTN / CNIC</div>
              <div className="detail-value">{invoice.buyerNTNCNIC}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Province</div>
              <div className="detail-value">{invoice.buyerProvince}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products List Details */}
      <div className="section">
        <div className="section-title">Products List Details</div>
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>HS Code</th>
              <th className="text-right">Rate</th>
              <th className="text-center">UoM</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Total</th>
              <th className="text-right">Sales Excl. ST</th>
              <th className="text-right">Fixed Value</th>
              <th className="text-center">Tax App</th>
              <th className="text-right">Sales Tax</th>
              <th className="text-right">Extra Tax</th>
              <th className="text-right">Further Tax</th>
              <th className="text-center">SRO</th>
              <th className="text-right">FED</th>
              <th className="text-right">Discount</th>
              <th>Sale Type</th>
              <th className="text-center">SRO Serial</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.productDescription}</td>
                <td>{item.hsCode || '—'}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.rate), 'PKR')}</td>
                <td className="text-center">{item.uoM}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.totalValues), 'PKR')}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.valueSalesExcludingST), 'PKR')}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.fixedNotifiedValueOrRetailPrice), 'PKR')}</td>
                <td className="text-center">{item.salesTaxApplicable}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.salesTaxWithheldAtSource), 'PKR')}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.extraTax), 'PKR')}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.furtherTax), 'PKR')}</td>
                <td className="text-center">{item.sroScheduleNo}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.fedPayable), 'PKR')}</td>
                <td className="text-right">{formatCurrency(parseFloat(item.discount), 'PKR')}</td>
                <td>{item.saleType}</td>
                <td className="text-center">{item.sroItemSerialNo}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="text-right">Totals</td>
              <td className="text-right">{formatCurrency(totals.total, 'PKR')}</td>
              <td className="text-right">{formatCurrency(totals.amount, 'PKR')}</td>
              <td className="text-right">{formatCurrency(totals.amount, 'PKR')}</td>
              <td className="text-center">—</td>
              <td className="text-right">{formatCurrency(totals.tax, 'PKR')}</td>
              <td className="text-right">{formatCurrency(totals.tax, 'PKR')}</td>
              <td className="text-right">{formatCurrency(totals.tax, 'PKR')}</td>
              <td className="text-center">—</td>
              <td className="text-right">{formatCurrency(0, 'PKR')}</td>
              <td className="text-right">{formatCurrency(0, 'PKR')}</td>
              <td className="text-center">—</td>
              <td className="text-center">—</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Tax Details */}
      <div className="section">
        <div className="section-title">Tax Details (FBR Pakistan)</div>
        <div className="tax-grid">
          <div>
            <div className="tax-item">
              <div className="tax-label">Net Amount</div>
              <div className="tax-value">{formatCurrency(totals.amount, 'PKR')}</div>
            </div>
            <div className="tax-item">
              <div className="tax-label">FBR Status</div>
              <div className="tax-value">{invoice.status}</div>
            </div>
          </div>
          <div>
            <div className="tax-item">
              <div className="tax-label">Tax Amount</div>
              <div className="tax-value">{formatCurrency(totals.tax, 'PKR')}</div>
            </div>
            <div className="tax-item">
              <div className="tax-label">Total Amount</div>
              <div className="tax-value">{formatCurrency(totals.total, 'PKR')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
