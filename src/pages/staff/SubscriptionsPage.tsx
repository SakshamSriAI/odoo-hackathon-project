import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useNotification } from '../../context/NotificationContext';
import { Subscription, SubscriptionStatus } from '../../types/sales';
import { SubscriptionDetailsView } from '../../components/sales/SubscriptionDetailsView';
import { QuotationGeneratorModal } from '../../components/sales/QuotationGeneratorModal';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const { subscriptions, selectedSubscription, setSelectedSubscription } = useSales();
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [viewingDetailSub, setViewingDetailSub] = useState<Subscription | null>(null);

  // Sync if selected sub changed
  const currentSub = viewingDetailSub || selectedSubscription;

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeTab === 'all' || sub.status === activeTab;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, activeTab]);

  const statusBadges: Record<SubscriptionStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    quotation: { label: 'Quotation', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    confirmed: { label: 'Confirmed', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    closed: { label: 'Closed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  // If viewing details of a single subscription, render the complete SubscriptionDetailsView!
  if (viewingDetailSub) {
    return (
      <SubscriptionDetailsView
        subscription={viewingDetailSub}
        onBack={() => setViewingDetailSub(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Subscription Management & Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client subscription progression across Draft, Quotation, Confirmed, Active, and Closed
          </p>
        </div>

        <button
          onClick={() => setIsGeneratorModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>New Quotation from Template</span>
        </button>
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
            placeholder="Search by subscription #, customer company, or plan name..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Pipeline Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'draft'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setActiveTab('quotation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'quotation'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Quotation
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'confirmed'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'closed'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Subscriptions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer & Organization</th>
                <th className="py-3 px-4">Plan & Frequency</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4">Term Validity</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No subscriptions found for this status.</p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setViewingDetailSub(sub)}
                    >
                      {/* Subscription Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {sub.id}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Ref: {sub.quotationNumber}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.customer.company}</div>
                        <div className="text-[11px] text-slate-500">{sub.customer.name}</div>
                      </td>

                      {/* Plan Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{sub.planName}</div>
                        <div className="text-[10px] text-purple-700 font-semibold uppercase">
                          {sub.planFrequency}
                        </div>
                      </td>

                      {/* Pipeline Status Stepper Indicator */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                            statusBadges[sub.status].color
                          }`}
                        >
                          {statusBadges[sub.status].label}
                        </span>
                      </td>

                      {/* Term Validity */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <div>Start: {sub.startDate}</div>
                        <div className="text-slate-400">End: {sub.expiryDate}</div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${sub.grandTotal.toLocaleString()}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {sub.itemizedLines.length} line(s)
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setViewingDetailSub(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Pipeline</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Generator */}
      <QuotationGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onSuccess={(subId) => {
          const created = subscriptions.find((s) => s.id === subId);
          if (created) setViewingDetailSub(created);
        }}
      />
    </div>
  );
};
