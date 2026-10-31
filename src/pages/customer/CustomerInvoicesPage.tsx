import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Receipt,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  Building2,
  Printer,
  X,
  CreditCard,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface CustomerInvoiceLine {
  id: string;
  subscriptionId: string;
  issueDate: string;
  dueDate: string;
  productLineSummary: string;
  itemizedCount: number;
  taxAmount: number;
  grandTotal: number;
  status: 'paid' | 'confirmed' | 'draft';
  items: Array<{
    description: string;
    sku: string;
    qty: number;
    unitPrice: number;
    tax: number;
    total: number;
  }>;
}

const DEFAULT_CUSTOMER_INVOICES: CustomerInvoiceLine[] = [
  {
    id: 'INV-2026-0891',
    subscriptionId: 'SUB-2026-8430',
    issueDate: '2025-01-15',
    dueDate: '2025-02-14',
    productLineSummary: 'Brightloop Cloud Orchestrator (Prime Edition ...)',
    itemizedCount: 2,
    taxAmount: 1417.35,
    grandTotal: 18094.55,
    status: 'paid',
    items: [
      {
        description: 'Brightloop Cloud Orchestrator (Prime Edition +$560)',
        sku: 'BL-CLOUD-ORCH-PRIME',
        qty: 5,
        unitPrice: 2960,
        tax: 1069.1,
        total: 13649.3,
      },
      {
        description: 'Real-Time Billing & Invoicing Engine (Prime Edition)',
        sku: 'BL-BILL-ENG-PRIME',
        qty: 2,
        unitPrice: 2410,
        tax: 348.25,
        total: 4445.25,
      },
    ],
  },
  {
    id: 'INV-2026-0912',
    subscriptionId: 'SUB-2026-7812',
    issueDate: '2025-03-25',
    dueDate: '2025-02-19',
    productLineSummary: 'Real-Time Billing & Invoicing Engine Prime Edi...',
    itemizedCount: 2,
    taxAmount: 408.25,
    grandTotal: 6130.25,
    status: 'confirmed',
    items: [
      {
        description: 'Real-Time Billing & Invoicing Engine Prime Edition',
        sku: 'BL-BILL-ENG-CORE',
        qty: 2,
        unitPrice: 2861,
        tax: 408.25,
        total: 6130.25,
      },
    ],
  },
  {
    id: 'INV-2026-0942',
    subscriptionId: 'SUB-2026-8872',
    issueDate: '2025-03-25',
    dueDate: '2025-04-09',
    productLineSummary: 'Real-Time Billing & Invoicing Engine Prime Edi...',
    itemizedCount: 1,
    taxAmount: 408.25,
    grandTotal: 6834.20,
    status: 'draft',
    items: [
      {
        description: 'Real-Time Billing & Invoicing Engine Prime Edition',
        sku: 'BL-BILL-ENG-ENT',
        qty: 2,
        unitPrice: 3212.98,
        tax: 408.25,
        total: 6834.2,
      },
    ],
  },
  {
    id: 'INV-2026-1025',
    subscriptionId: 'SUB-2026-8824',
    issueDate: '2025-04-05',
    dueDate: '2025-02-04',
    productLineSummary: 'Brightloop Cloud Orchestrator (Prime Edition ...)',
    itemizedCount: 1,
    taxAmount: 754.58,
    grandTotal: 8634.80,
    status: 'draft',
    items: [
      {
        description: 'Brightloop Cloud Orchestrator (Prime Edition)',
        sku: 'BL-CLOUD-ORCH',
        qty: 3,
        unitPrice: 2626.74,
        tax: 754.58,
        total: 8634.8,
      },
    ],
  },
  {
    id: 'INV-2026-1026',
    subscriptionId: 'SUB-2026-8824',
    issueDate: '2025-04-05',
    dueDate: '2025-03-08',
    productLineSummary: 'Brightloop Cloud Orchestrator (Prime Edition ...)',
    itemizedCount: 1,
    taxAmount: 754.88,
    grandTotal: 8634.80,
    status: 'draft',
    items: [
      {
        description: 'Brightloop Cloud Orchestrator (Prime Edition)',
        sku: 'BL-CLOUD-ORCH',
        qty: 3,
        unitPrice: 2626.64,
        tax: 754.88,
        total: 8634.8,
      },
    ],
  },
  {
    id: 'INV-2026-1027',
    subscriptionId: 'SUB-2026-8824',
    issueDate: '2025-04-05',
    dueDate: '2025-05-04',
    productLineSummary: 'Brightloop Cloud Orchestrator (Prime Edition ...)',
    itemizedCount: 1,
    taxAmount: 754.88,
    grandTotal: 8634.80,
    status: 'draft',
    items: [
      {
        description: 'Brightloop Cloud Orchestrator (Prime Edition)',
        sku: 'BL-CLOUD-ORCH',
        qty: 3,
        unitPrice: 2626.64,
        tax: 754.88,
        total: 8634.8,
      },
    ],
  },
];

export const CustomerInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const orgName = user?.organization || 'Acme Technologies Inc.';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'confirmed' | 'draft'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoiceLine | null>(null);
  const printReceiptRef = useRef<HTMLDivElement>(null);

  // Filter invoices based on search & status
  const filteredInvoices = useMemo(() => {
    return DEFAULT_CUSTOMER_INVOICES.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.subscriptionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.productLineSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleDownloadPdf = (invoiceId: string) => {
    notify(
      'success',
      'Tax Invoice Downloaded',
      `Official PDF receipt for ${invoiceId} has been generated and downloaded.`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metric Cards (3 in a row matching reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Paid */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              TOTAL PAID (YTD)
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              $18,094.55
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Certified tax receipts available
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Settlement */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PENDING SETTLEMENT
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
              $15,765.05
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Auto-debit scheduled for due date
            </div>
          </div>
        </div>

        {/* Metric 3: Tax Identifier & Exemption */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              TAX IDENTIFIER & EXEMPTION
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
              US-EIN-94-3829102
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Standard corporate rate: 8.5% applied
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Billing Records & Receipts Table Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Billing Records & Receipts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemized invoices and receipts for {orgName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-52 sm:w-60"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="confirmed">Confirmed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No invoices match your search</h4>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">INVOICE REFERENCE</th>
                  <th className="py-3.5 px-5">BILLING PERIOD / DATES</th>
                  <th className="py-3.5 px-5">PRODUCT LINES</th>
                  <th className="py-3.5 px-5 text-right">TAXES (8.5 %)</th>
                  <th className="py-3.5 px-5 text-right">TOTAL AMOUNT</th>
                  <th className="py-3.5 px-5 text-center">STATUS</th>
                  <th className="py-3.5 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const isConfirmed = inv.status === 'confirmed';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Invoice Reference & Sub ID */}
                      <td className="py-4 px-5">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {inv.id}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Sub: {inv.subscriptionId}
                        </div>
                      </td>

                      {/* Billing Dates */}
                      <td className="py-4 px-5">
                        <div className="text-slate-800 font-medium">Issued: {inv.issueDate}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Due: {inv.dueDate}</div>
                      </td>

                      {/* Product Lines Summary */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">
                          {inv.productLineSummary}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {inv.itemizedCount} itemized line{inv.itemizedCount > 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Taxes */}
                      <td className="py-4 px-5 text-right font-mono text-slate-600">
                        ${inv.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 text-right font-bold text-slate-900 text-sm">
                        ${inv.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isConfirmed
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid ? 'bg-emerald-500' : isConfirmed ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                          />
                          <span className="capitalize">{inv.status}</span>
                        </span>
                      </td>

                      {/* Actions: View and PDF */}
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
                          title="View Itemized Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(inv.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
                          title="Download Official Tax PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Itemized Tax Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Tax Receipt: {selectedInvoice.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div ref={printReceiptRef} className="p-6 space-y-6 text-xs text-slate-700">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="text-lg font-extrabold text-slate-900">Brightloop Software Inc.</div>
                  <div className="text-slate-500 mt-1">Enterprise Subscription & Cloud Operations</div>
                  <div className="text-slate-400 text-[11px]">Tax ID: US-EIN-88-2910394</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block uppercase">
                    Status: {selectedInvoice.status}
                  </div>
                  <div className="text-slate-500 mt-1.5">Issued: {selectedInvoice.issueDate}</div>
                  <div className="text-slate-500">Due: {selectedInvoice.dueDate}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Billed To Customer
                </div>
                <div className="font-bold text-slate-900 text-sm">{orgName}</div>
                <div className="text-slate-600">{user?.name || 'Emily Chen (CTO Corporate)'}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Tax / VAT ID: US-EIN-94-3829102
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Itemized Product Breakdown
                </div>
                <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Tax (8.5%)</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="text-slate-800">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold">{item.description}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.qty}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${item.tax.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (8.5%):</span>
                    <span className="font-mono font-medium">${selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700">
                      ${selectedInvoice.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadPdf(selectedInvoice.id);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
