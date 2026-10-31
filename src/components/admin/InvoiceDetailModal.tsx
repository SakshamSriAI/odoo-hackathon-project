import React, { useRef } from 'react';
import { useInvoicing } from '../../context/InvoicingContext';
import { useNotification } from '../../context/NotificationContext';
import { Invoice, InvoiceStatus } from '../../types/invoicing';
import {
  X,
  CheckCircle2,
  XCircle,
  Send,
  Printer,
  Building,
  User,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  Sparkles,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { confirmInvoice, cancelInvoice, sendInvoice, markInvoicePaid } = useInvoicing();
  const { notify } = useNotification();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const handleConfirm = () => {
    confirmInvoice(invoice.id);
    notify('success', 'Invoice Confirmed', `Invoice ${invoice.id} marked as Confirmed.`);
  };

  const handleCancel = () => {
    if (confirm(`Are you sure you want to cancel invoice ${invoice.id}?`)) {
      cancelInvoice(invoice.id);
      notify('warning', 'Invoice Cancelled', `Invoice ${invoice.id} has been cancelled.`);
    }
  };

  const handleSend = () => {
    sendInvoice(invoice.id);
    notify(
      'success',
      'Invoice Dispatched',
      `Electronic invoice ${invoice.id} sent to ${invoice.customer.email}.`
    );
  };

  const handlePrint = () => {
    window.print();
    notify('info', 'Print Triggered', `Initiated print dialog for ${invoice.id}.`);
  };

  const handleMarkPaid = () => {
    markInvoicePaid(invoice.id);
    notify('success', 'Marked as Paid', `Invoice ${invoice.id} payment settlement confirmed.`);
  };

  const statusBadges: Record<InvoiceStatus, { label: string; badge: string }> = {
    draft: { label: 'Draft', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
    confirmed: { label: 'Confirmed', badge: 'bg-amber-50 text-amber-800 border-amber-300' },
    paid: { label: 'Paid', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    cancelled: { label: 'Cancelled', badge: 'bg-rose-50 text-rose-700 border-rose-300' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col justify-between animate-modal-pop">
        {/* Top Control Bar (Sticky) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-slate-900">{invoice.id}</span>
            {/* Status Indicator (Draft, Confirmed, Paid) */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase border badge-interactive ${
                statusBadges[invoice.status].badge
              }`}
            >
              {statusBadges[invoice.status].label}
            </span>
          </div>

          {/* Action Buttons: Confirm, Cancel, Send, Print */}
          <div className="flex items-center gap-2">
            {invoice.status === 'draft' && (
              <button
                onClick={handleConfirm}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Confirm Invoice"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm</span>
              </button>
            )}

            {invoice.status === 'confirmed' && (
              <button
                onClick={handleMarkPaid}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Record Payment as Paid"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            <button
              onClick={handleSend}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Send to Customer Email"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Print Invoice Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
              <button
                onClick={handleCancel}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                title="Cancel Invoice"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="btn-tactile p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div ref={printAreaRef} className="p-8 space-y-8 bg-white printable-area">
          {/* Brand Header & Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    Brightloop Software
                  </h1>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Subscription Management Platform
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Brightloop Software Inc. • 500 Enterprise Way, Suite 800<br />
                San Francisco, CA 94105 • support@brightloop.io
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Commercial Tax Invoice
              </span>
              <div className="text-2xl font-black font-mono text-slate-900">{invoice.id}</div>
              <div className="text-xs text-slate-500">
                Issue Date: <strong className="text-slate-800">{invoice.invoiceDate}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Due Date: <strong className="text-rose-700">{invoice.dueDate}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Payment Terms: <strong className="text-slate-800 uppercase">{invoice.paymentTerms}</strong>
              </div>
            </div>
          </div>

          {/* Pre-filled Customer Details (Phase 4 Requirement) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Pre-Filled Customer Details):
              </span>
              <div className="font-bold text-sm text-slate-900">{invoice.customer.company}</div>
              <div className="text-slate-700 mt-0.5">Attn: {invoice.customer.name}</div>
              <div className="text-slate-600 mt-0.5">{invoice.customer.email}</div>
              {invoice.customer.address && (
                <div className="text-slate-500 mt-1">{invoice.customer.address}</div>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Account & References:
              </span>
              <div className="text-slate-700">
                Customer Ref ID: <span className="font-mono">{invoice.customer.id}</span>
              </div>
              {invoice.subscriptionId && (
                <div className="text-slate-700">
                  Subscription Ref: <span className="font-mono font-semibold text-indigo-600">{invoice.subscriptionId}</span>
                </div>
              )}
              {invoice.customer.taxId && (
                <div className="text-slate-700">
                  Tax / VAT ID: <span className="font-mono">{invoice.customer.taxId}</span>
                </div>
              )}
              {invoice.sentAt && (
                <div className="text-slate-400 text-[11px]">
                  Dispatched: {new Date(invoice.sentAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Product Lines Data Table (Phase 4 Requirement) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Itemized Product Line</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">Tax (8.5%)</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.description}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.sku}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      ${item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">
                      {item.discountAmount > 0 ? `-$${item.discountAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      ${item.taxAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${item.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Automatically Calculated Taxes & Financial Summary Footer (Phase 4 Requirement) */}
            <div className="p-5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs text-slate-500 max-w-sm">
                <span className="font-semibold text-slate-700 block mb-0.5">Remittance Instructions:</span>
                Wire transfer or automated ACH to Brightloop Software Inc., Chase JP Morgan Routing #021000021, Account #982104921.
              </div>

              <div className="space-y-1.5 text-right w-full sm:w-auto text-xs">
                <div className="flex justify-between sm:justify-end gap-6 text-slate-600">
                  <span>Gross Product Subtotal:</span>
                  <span className="font-mono font-semibold">${invoice.subtotal.toLocaleString()}</span>
                </div>

                {invoice.discountTotal > 0 && (
                  <div className="flex justify-between sm:justify-end gap-6 text-amber-700 font-semibold">
                    <span>Discount Deductions:</span>
                    <span className="font-mono">-${invoice.discountTotal.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between sm:justify-end gap-6 text-slate-600">
                  <span>Automatically Calculated Taxes (8.5%):</span>
                  <span className="font-mono">${invoice.taxTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between sm:justify-end gap-6 text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total Payable:</span>
                  <span className="font-mono text-indigo-600 text-lg">
                    ${invoice.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Brightloop Automated Invoicing Engine • Enterprise Billing</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
