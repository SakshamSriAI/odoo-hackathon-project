import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useNotification } from '../../context/NotificationContext';
import { QuotationGeneratorModal } from '../../components/sales/QuotationGeneratorModal';
import { SubscriptionDetailsView } from '../../components/sales/SubscriptionDetailsView';
import { Subscription } from '../../types/sales';
import {
  FileSpreadsheet,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Send,
  CheckCircle2,
  Building,
  User,
  DollarSign,
  Layers,
} from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const { templates, subscriptions, advanceSubscriptionStatus } = useSales();
  const { notify } = useNotification();

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedSubForView, setSelectedSubForView] = useState<Subscription | null>(null);

  // Active proposals in draft or quotation stage
  const pendingQuotations = subscriptions.filter(
    (s) => s.status === 'draft' || s.status === 'quotation'
  );

  if (selectedSubForView) {
    return (
      <SubscriptionDetailsView
        subscription={selectedSubForView}
        onBack={() => setSelectedSubForView(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quotation Blueprint Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-packaged sales proposals, automated price calculations, and quotation-to-subscription pipeline initiation
          </p>
        </div>

        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Custom Quotation</span>
        </button>
      </div>

      {/* Blueprint Templates Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Standardized Quotation Templates</span>
          </h3>
          <span className="text-xs text-indigo-600 font-semibold">1-Click Launch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                    {tmpl.targetTier}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Terms: {tmpl.defaultPaymentTerms.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{tmpl.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {tmpl.lineItemDrafts.length} bundled product line(s)
                </span>
                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <span>Apply Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Proposals Awaiting Customer Confirmation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quotations in draft or delivered stage progressing through the pipeline
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {pendingQuotations.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Quotation Ref</th>
                <th className="py-3 px-4">Customer Entity</th>
                <th className="py-3 px-4">Plan & Validity</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingQuotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No active proposals currently in draft or quotation stage.
                  </td>
                </tr>
              ) : (
                pendingQuotations.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {sub.quotationNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        Sub: {sub.id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sub.customer.company}</div>
                      <div className="text-[11px] text-slate-500">{sub.customer.name}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{sub.planName}</div>
                      <div className="text-[11px] text-slate-500">Expires: {sub.expiryDate}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                          sub.status === 'draft'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${sub.grandTotal.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sub.status === 'draft' && (
                          <button
                            onClick={() => {
                              advanceSubscriptionStatus(sub.id, 'quotation');
                              notify('success', 'Quotation Dispatched', `Sent ${sub.quotationNumber} to customer.`);
                            }}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors"
                          >
                            Send Quote
                          </button>
                        )}
                        {sub.status === 'quotation' && (
                          <button
                            onClick={() => {
                              advanceSubscriptionStatus(sub.id, 'confirmed');
                              notify('success', 'Contract Confirmed', `Customer signed ${sub.quotationNumber}!`);
                            }}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold transition-colors"
                          >
                            Mark Confirmed
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSubForView(sub)}
                          className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                        >
                          View Details
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

      {/* Quotation Generator Modal */}
      <QuotationGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSuccess={(id) => {
          const created = subscriptions.find((s) => s.id === id);
          if (created) setSelectedSubForView(created);
        }}
      />
    </div>
  );
};
