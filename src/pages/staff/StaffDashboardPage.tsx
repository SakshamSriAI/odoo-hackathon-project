import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, sanitizeName } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import { QuotationGeneratorModal } from '../../components/sales/QuotationGeneratorModal';
import { SubscriptionDetailsView } from '../../components/sales/SubscriptionDetailsView';
import { Subscription, SubscriptionStatus } from '../../types/sales';
import {
  FileSpreadsheet,
  Layers,
  CreditCard,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Plus,
  Eye,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { subscriptions } = useSales();

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedSubForView, setSelectedSubForView] = useState<Subscription | null>(null);

  // Group counts by status
  const counts: Record<SubscriptionStatus, number> = {
    draft: subscriptions.filter((s) => s.status === 'draft').length,
    quotation: subscriptions.filter((s) => s.status === 'quotation').length,
    confirmed: subscriptions.filter((s) => s.status === 'confirmed').length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    closed: subscriptions.filter((s) => s.status === 'closed').length,
  };

  const totalPipelineRevenue = subscriptions
    .filter((s) => s.status !== 'closed')
    .reduce((acc, s) => acc + s.grandTotal, 0);

  const pipelineStages = [
    { name: 'Draft', count: counts.draft, color: 'bg-slate-200 text-slate-700' },
    { name: 'Quotation', count: counts.quotation, color: 'bg-blue-100 text-blue-800' },
    { name: 'Confirmed', count: counts.confirmed, color: 'bg-amber-100 text-amber-800' },
    { name: 'Active', count: counts.active, color: 'bg-emerald-100 text-emerald-800' },
    { name: 'Closed', count: counts.closed, color: 'bg-slate-100 text-slate-600' },
  ];

  if (selectedSubForView) {
    return (
      <SubscriptionDetailsView
        subscription={selectedSubForView}
        onBack={() => setSelectedSubForView(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg relative overflow-hidden card-shine">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium mb-3 badge-interactive">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Brightloop Staff Portal • Sales Operations & Fulfillment</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Sales & Operations Workspace: {sanitizeName(user?.name) || 'Staff Member'}
          </h2>
          <p className="text-blue-200 text-sm mt-1 leading-relaxed">
            Generate new quotations from standardized templates, advance client lifecycles across the visual status pipeline, and inspect itemized product lines.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3 relative z-10 text-xs">
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold hover:bg-blue-50 transition-all shadow-md shadow-black/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Generate from Quotation Template</span>
          </button>

          <Link
            to="/staff/subscriptions"
            className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white font-bold transition-all shadow-md shadow-blue-900/30"
          >
            <Layers className="w-4 h-4" />
            <span>View Subscriptions Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hover-lift group p-5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Pending Quotations</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{counts.quotation + counts.draft} Proposals</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
            {counts.draft} Drafts, {counts.quotation} Sent
          </div>
        </div>

        <div className="hover-lift group p-5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Subscriptions</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{counts.active} Subscriptions</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Currently provisioned & recurring
          </div>
        </div>

        <div className="hover-lift group p-5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Awaiting Confirmation</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{counts.confirmed} Confirmed</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
            Ready for provision rollout
          </div>
        </div>

        <div className="hover-lift group p-5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Active Pipeline</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            ${Math.round(totalPipelineRevenue).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Across all unclosed accounts</div>
        </div>
      </div>

      {/* Visual Status Pipeline Stepper Preview */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Live Pipeline Progression
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Subscription Status Pipeline Overview
            </h3>
          </div>
          <Link
            to="/staff/subscriptions"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Manage pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5-Stage Visual Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {pipelineStages.map((stage, idx) => (
            <Link
              key={stage.name}
              to="/staff/subscriptions"
              className="hover-lift p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>0{idx + 1}. {stage.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold badge-interactive ${stage.color}`}>
                  {stage.count}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                {stage.name === 'Draft' && 'Quote initialized'}
                {stage.name === 'Quotation' && 'Sent to customer'}
                {stage.name === 'Confirmed' && 'Customer accepted'}
                {stage.name === 'Active' && 'Billing recurringly'}
                {stage.name === 'Closed' && 'Lifecycle completed'}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Subscription Accounts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Direct link to subscription details and itemized product lines</p>
          </div>
          <Link
            to="/staff/subscriptions"
            className="btn-tactile text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {subscriptions.slice(0, 4).map((sub) => (
            <div
              key={sub.id}
              onClick={() => setSelectedSubForView(sub)}
              className="interactive-row p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {sub.id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ref: {sub.quotationNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sub.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'confirmed'
                        ? 'bg-amber-100 text-amber-800'
                        : sub.status === 'quotation'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{sub.customer.company}</h4>
                <div className="text-xs text-slate-500">
                  <span>{sub.planName}</span>
                  <span className="mx-2">•</span>
                  <span>Terms: {sub.paymentTerms.toUpperCase()}</span>
                  <span className="mx-2">•</span>
                  <span>{sub.itemizedLines.length} product lines</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    ${sub.grandTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Total with taxes</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubForView(sub);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="View Subscription Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generator Modal */}
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
