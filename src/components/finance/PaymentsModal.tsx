import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useInvoicing } from '../../context/InvoicingContext';
import { useNotification } from '../../context/NotificationContext';
import { PaymentMethod } from '../../types/finance';
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  Building,
  FileSpreadsheet,
  CheckCircle2,
  Plus,
  Receipt,
  FileText,
} from 'lucide-react';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedInvoiceId?: string;
}

export const PaymentsModal: React.FC<PaymentsModalProps> = ({
  isOpen,
  onClose,
  preSelectedInvoiceId,
}) => {
  const { invoices } = useInvoicing();
  const { recordPayment } = useFinance();
  const { notify } = useNotification();

  // Find valid unpaid or confirmed invoices
  const eligibleInvoices = invoices.filter((i) => i.status !== 'cancelled');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    preSelectedInvoiceId || eligibleInvoices[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ach');
  const [amount, setAmount] = useState<number>(() => {
    const inv = invoices.find((i) => i.id === (preSelectedInvoiceId || eligibleInvoices[0]?.id));
    return inv ? inv.grandTotal : 5000;
  });
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNotes, setReferenceNotes] = useState('');

  if (!isOpen) return null;

  const currentInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const target = invoices.find((i) => i.id === invId);
    if (target) {
      setAmount(target.grandTotal);
    }
  };

  const handleFillFull = () => {
    if (currentInvoice) {
      setAmount(currentInvoice.grandTotal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInvoiceId) {
      notify('error', 'Invoice Required', 'Please select a target invoice.');
      return;
    }
    if (amount <= 0) {
      notify('error', 'Invalid Amount', 'Transaction amount must be greater than $0.');
      return;
    }

    const createdTxn = recordPayment({
      invoiceId: selectedInvoiceId,
      amount,
      paymentMethod,
      transactionDate,
      referenceNotes,
    });

    notify(
      'success',
      'Payment Transaction Recorded',
      `Logged $${amount.toLocaleString()} (${paymentMethod.toUpperCase()}) for ${createdTxn.customerCompany}.`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-modal-pop">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                Treasury
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Payment Entry</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Record Incoming Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Invoice Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="pay-invoice">
              Select Target Invoice *
            </label>
            <select
              id="pay-invoice"
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              required
            >
              {eligibleInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} — {inv.customer.company} (${inv.grandTotal.toLocaleString()} • Status: {inv.status.toUpperCase()})
                </option>
              ))}
            </select>
            {currentInvoice && (
              <p className="text-[11px] text-slate-500 mt-1">
                Customer: <strong>{currentInvoice.customer.company}</strong> ({currentInvoice.customer.email})
              </p>
            )}
          </div>

          {/* Payment Method Selector (Phase 5 Requirement) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ach', label: 'ACH Transfer' },
                { id: 'wire_transfer', label: 'Wire Transfer' },
                { id: 'credit_card', label: 'Credit Card' },
                { id: 'check', label: 'Check' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input with Quick Helper (Phase 5 Requirement) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="pay-amount">
                Transaction Amount ($ USD) *
              </label>
              {currentInvoice && (
                <button
                  type="button"
                  onClick={handleFillFull}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Pay Full (${currentInvoice.grandTotal.toLocaleString()})
                </button>
              )}
            </div>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="pay-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Date Picker (Phase 5 Requirement) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="pay-date">
              Transaction Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="pay-date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Reference Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="pay-notes">
              Transaction Notes & Reference *
            </label>
            <textarea
              id="pay-notes"
              rows={2}
              value={referenceNotes}
              onChange={(e) => setReferenceNotes(e.target.value)}
              placeholder="e.g. Bank confirmation #WIRE-89210, Chase Clearing batch..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Payment in Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
