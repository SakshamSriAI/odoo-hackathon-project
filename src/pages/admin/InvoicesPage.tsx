import React, { useState, useMemo } from 'react';
import { useInvoicing } from '../../context/InvoicingContext';
import { useNotification } from '../../context/NotificationContext';
import { Invoice, InvoiceStatus } from '../../types/invoicing';
import { InvoiceDetailModal } from '../../components/admin/InvoiceDetailModal';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Send,
  Printer,
  Eye,
  Download,
  Calendar,
  Building,
  DollarSign,
  FileText,
  Sparkles,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { invoices, confirmInvoice, cancelInvoice, sendInvoice } = useInvoicing();
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeTab === 'all' || inv.status === activeTab;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, activeTab]);

  const handleConfirm = (inv: Invoice) => {
    confirmInvoice(inv.id);
    notify('success', 'Invoice Confirmed', `Invoice ${inv.id} has been moved to Confirmed status.`);
  };

  const handleCancel = (inv: Invoice) => {
    if (confirm(`Are you sure you want to cancel invoice ${inv.id}?`)) {
      cancelInvoice(inv.id);
      notify('warning', 'Invoice Cancelled', `Invoice ${inv.id} has been cancelled.`);
    }
  };

  const handleSend = (inv: Invoice) => {
    sendInvoice(inv.id);
    notify(
      'success',
      'Invoice Sent',
      `Dispatched billing notice for ${inv.id} to ${inv.customer.email}.`
    );
  };

  const handlePrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const statusBadges: Record<InvoiceStatus, { label: string; badge: string }> = {
    draft: { label: 'Draft', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
    confirmed: { label: 'Confirmed', badge: 'bg-amber-50 text-amber-800 border-amber-300' },
    paid: { label: 'Paid', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    cancelled: { label: 'Cancelled', badge: 'bg-rose-50 text-rose-700 border-rose-300' },
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Automated Invoices & Billing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit generated invoices, inspect automatically calculated taxes, and trigger Confirm, Cancel, Send, and Print operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs badge-interactive">
            Total Invoices: <strong className="text-indigo-600 font-mono">{invoices.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices by ID, client company, or customer name..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Status Filter Tabs (Draft, Confirmed, Paid, Cancelled) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'draft'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'confirmed'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'paid'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Pre-Filled Customer Details</th>
                <th className="py-3 px-4">Issue & Due Date</th>
                <th className="py-3 px-4">Status Indicator</th>
                <th className="py-3 px-4 text-right">Calculated Taxes</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Action Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No invoices match selected criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="interactive-row cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    {/* Invoice ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {inv.id}
                      {inv.subscriptionId && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          {inv.subscriptionId}
                        </div>
                      )}
                    </td>

                    {/* Pre-Filled Customer Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.customer.company}</div>
                      <div className="text-[11px] text-slate-500">
                        {inv.customer.name} ({inv.customer.email})
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-800">{inv.invoiceDate}</div>
                      <div className="text-slate-400">Due: {inv.dueDate}</div>
                    </td>

                    {/* Status Indicator (Draft, Confirmed, Paid) */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border badge-interactive ${
                          statusBadges[inv.status].badge
                        }`}
                      >
                        {statusBadges[inv.status].label}
                      </span>
                    </td>

                    {/* Calculated Taxes */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-600">
                      ${inv.taxTotal.toLocaleString()}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${inv.grandTotal.toLocaleString()}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {inv.lineItems.length} product line(s)
                      </div>
                    </td>

                    {/* Action Buttons: Confirm, Cancel, Send, Print */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Confirm */}
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => handleConfirm(inv)}
                            className="btn-tactile p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Confirm Invoice"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Send */}
                        <button
                          onClick={() => handleSend(inv)}
                          className="btn-tactile p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Send Invoice to Customer"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {/* Print */}
                        <button
                          onClick={() => handlePrint(inv)}
                          className="btn-tactile p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Cancel */}
                        {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                          <button
                            onClick={() => handleCancel(inv)}
                            className="btn-tactile p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Invoice"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Modal */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="btn-tactile p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};
