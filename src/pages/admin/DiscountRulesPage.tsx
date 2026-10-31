import React, { useState } from 'react';
import { useInvoicing } from '../../context/InvoicingContext';
import { useNotification } from '../../context/NotificationContext';
import { DiscountRule } from '../../types/invoicing';
import { DiscountRuleModal } from '../../components/admin/DiscountRuleModal';
import {
  Percent,
  Plus,
  Search,
  DollarSign,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const DiscountRulesPage: React.FC = () => {
  const { discountRules, deleteDiscountRule } = useInvoicing();
  const { notify } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<DiscountRule | null>(null);

  const filteredRules = discountRules.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (rule: DiscountRule) => {
    if (confirm(`Are you sure you want to delete discount rule "${rule.name}"?`)) {
      deleteDiscountRule(rule.id);
      notify('info', 'Rule Removed', `Removed discount rule ${rule.name}.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Discount Rules Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure fixed amount ($) or percentage (%) discounts, minimum quantities, scheduling windows, and usage caps
          </p>
        </div>

        <button
          onClick={() => {
            setRuleToEdit(null);
            setIsModalOpen(true);
          }}
          className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount Rule</span>
        </button>
      </div>

      {/* Explainer Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover-lift">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Automated Rules Engine & Volume Thresholds</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 badge-interactive">
                Active Policy
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Rules execute automatically during invoice assembly when subscribers satisfy designated minimum order quantities and valid date ranges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">
            Active Rules: <strong className="text-amber-300 font-mono">{discountRules.length}</strong>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search discount rules by name, promo code, or description..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Discount Rules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRules.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Percent className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-medium">No discount rules matching search criteria.</p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const usagePercent = Math.min(100, Math.round((rule.timesUsed / rule.usageLimit) * 100));

            return (
              <div
                key={rule.id}
                className="hover-lift card-shine bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-amber-300 dark:hover:border-amber-500 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded badge-interactive">
                          {rule.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase badge-interactive ${
                            rule.type === 'percentage'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {rule.type === 'percentage' ? `${rule.value}% Discount` : `$${rule.value.toLocaleString()} Deduction`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{rule.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setRuleToEdit(rule);
                          setIsModalOpen(true);
                        }}
                        className="btn-tactile p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule)}
                        className="btn-tactile p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                {/* Parameters & Criteria */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Min Purchase Quantity</span>
                    <span className="font-bold text-slate-900">
                      {rule.minimumPurchaseQuantity} {rule.minimumPurchaseQuantity > 1 ? 'Units' : 'Unit'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Availability Window</span>
                    <span className="font-mono text-[11px] text-slate-700 truncate block">
                      {rule.startDate} → {rule.endDate}
                    </span>
                  </div>
                </div>

                {/* Usage Count Progress Bar */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Redemption Usage Cap:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {rule.timesUsed} / {rule.usageLimit} Redeemed ({usagePercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        usagePercent >= 90
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : usagePercent >= 50
                          ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                          : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <DiscountRuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRuleToEdit(null);
        }}
        ruleToEdit={ruleToEdit}
      />
    </div>
  );
};
