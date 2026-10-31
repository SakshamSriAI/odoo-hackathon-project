import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useInvoicing } from '../../context/InvoicingContext';
import { useNotification } from '../../context/NotificationContext';
import { PaymentMethod, PaymentTransaction } from '../../types/finance';
import { PaymentsModal } from '../../components/finance/PaymentsModal';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  Receipt,
  Download,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { transactions } = useFinance();
  const { notify } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.referenceNotes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [transactions, searchTerm, methodFilter]);

  const totalCollected = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  const methodBadges: Record<PaymentMethod, { label: string; color: string }> = {
    ach: { label: 'ACH Transfer', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    wire_transfer: { label: 'Wire Transfer', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    credit_card: { label: 'Credit Card', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    check: { label: 'Lockbox Check', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    other: { label: 'Other', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Incoming Payments & Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record customer payments against invoices by method, amount, date, and reference notes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* Explainer Banner */}
      <div className="hover-lift p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-900 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Staff Payments Reconciliation Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 badge-interactive">
                Live Reconciliation
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Recorded incoming payments are automatically reconciled against commercial invoices and synchronized with the Finance Lead Dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">
            Collected Cash: <strong className="text-emerald-300 font-mono">${Math.round(totalCollected).toLocaleString()}</strong>
          </div>
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
            placeholder="Search by transaction ID, invoice ID, or customer entity..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Method Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setMethodFilter('all')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'all'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Methods ({transactions.length})
          </button>
          <button
            onClick={() => setMethodFilter('ach')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'ach'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ACH
          </button>
          <button
            onClick={() => setMethodFilter('wire_transfer')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'wire_transfer'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Wire Transfer
          </button>
          <button
            onClick={() => setMethodFilter('credit_card')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'credit_card'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Credit Card
          </button>
          <button
            onClick={() => setMethodFilter('check')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'check'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Check
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Invoice Reference</th>
                <th className="py-3 px-4">Customer Entity</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4">Reference Notes</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No payment transactions match criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="interactive-row">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {txn.id}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {txn.invoiceId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{txn.customerCompany}</div>
                      <div className="text-[11px] text-slate-500">{txn.customerName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border badge-interactive ${
                          methodBadges[txn.paymentMethod]?.color || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {methodBadges[txn.paymentMethod]?.label || txn.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {txn.transactionDate}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ${txn.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-500 italic max-w-xs truncate">
                      {txn.referenceNotes}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-600 font-medium">
                      {txn.staffRecordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments Modal */}
      <PaymentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
