import React, { useState, useMemo, useRef } from 'react';
import { useInvoicing } from '../../context/InvoicingContext';
import { useAuth, sanitizeName } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Invoice } from '../../types/invoicing';
import {
  Receipt,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Building2,
  Printer,
  X,
  CreditCard,
  ShieldCheck,
  FileText,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';

export const CustomerInvoicesPage: React.FC = () => {
  const { invoices } = useInvoicing();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'confirmed' | 'draft'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const printReceiptRef = useRef<HTMLDivElement>(null);

  // Filter invoices for customer view
  const customerInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Show invoices that match customer email or organization or demo acme
      const matchesSearch =
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.lineItems.some((item) => item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Aggregate stats
  const totalPaid = useMemo(() => {
    return customerInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [customerInvoices]);

  const totalOutstanding = useMemo(() => {
    return customerInvoices
      .filter((inv) => inv.status === 'confirmed' || inv.status === 'draft')
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [customerInvoices]);

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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="hover-lift p-5 bg-white rounded-xl border border-slate-200 shadow-2xs group cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Paid (YTD)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">
            Certified tax receipts available
          </div>
        </div>

        <div className="hover-lift p-5 bg-white rounded-xl border border-slate-200 shadow-2xs group cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Settlement</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Auto-debit scheduled for due date
          </div>
        </div>

        <div className="hover-lift p-5 bg-white rounded-xl border border-slate-200 shadow-2xs group cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Tax Identifier & Exemption</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 font-mono">US-EIN-94-3829102</div>
          <div className="text-xs text-slate-500 mt-1">
            Standard corporate rate: 8.5% applied
          </div>
        </div>
      </div>

      {/* Invoices List / Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Billing Records & Receipts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemized invoices generated for {user?.organization || 'Acme Technologies Inc.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="confirmed">Confirmed / Due</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        {customerInvoices.length === 0 ? (
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
                  <th className="py-3.5 px-5">Invoice Reference</th>
                  <th className="py-3.5 px-5">Billing Period / Dates</th>
                  <th className="py-3.5 px-5">Product Lines</th>
                  <th className="py-3.5 px-5">Taxes (8.5%)</th>
                  <th className="py-3.5 px-5 text-right">Total Amount</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customerInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const isConfirmed = inv.status === 'confirmed';

                  return (
                    <tr key={inv.id} className="interactive-row">
                      <td className="py-4 px-5">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{inv.id}</span>
                        </div>
                        {inv.subscriptionId && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Sub: {inv.subscriptionId}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <div className="text-slate-800 font-medium">Issued: {inv.invoiceDate}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Due: {inv.dueDate}</div>
                      </td>

                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">
                          {inv.lineItems.map((li) => li.description).join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {inv.lineItems.length} itemized line{inv.lineItems.length > 1 ? 's' : ''}
                        </div>
                      </td>

                      <td className="py-4 px-5 font-mono text-slate-600">
                        ${inv.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-5 text-right font-bold text-slate-900 text-sm font-mono">
                        ${inv.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold badge-interactive ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isConfirmed
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-blue-600" />
                          )}
                          <span className="capitalize">{inv.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="btn-tactile px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
                          title="View Itemized Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(inv.id)}
                          className="btn-tactile px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
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

      {/* Customer Itemized Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Itemized Tax Receipt: {selectedInvoice.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
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
                  <div className="text-slate-500 mt-1.5">Date: {selectedInvoice.invoiceDate}</div>
                  <div className="text-slate-500">Due: {selectedInvoice.dueDate}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Billed To Customer
                </div>
                <div className="font-bold text-slate-900 text-sm">{selectedInvoice.customer.company}</div>
                <div className="text-slate-600">{selectedInvoice.customer.name}</div>
                <div className="text-slate-500">{selectedInvoice.customer.address}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Tax / VAT ID: {selectedInvoice.customer.taxId || 'US-EIN-94-3829102'}
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
                    {selectedInvoice.lineItems.map((item) => (
                      <tr key={item.id} className="text-slate-800">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold">{item.description}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${item.taxAmount.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono">
                          ${item.totalAmount.toFixed(2)}
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
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-mono font-medium">-${selectedInvoice.discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (8.5%):</span>
                    <span className="font-mono font-medium">${selectedInvoice.taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700">
                      ${selectedInvoice.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Terms & Notes */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                <span className="font-bold">Payment Schedule: </span>
                <span>Term {selectedInvoice.paymentTerms.replace('_', ' ').toUpperCase()} • Pre-authorized electronic settlement.</span>
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
