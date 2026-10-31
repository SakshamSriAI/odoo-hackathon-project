import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import {
  SubscriptionPlan,
  BillingFrequency,
  PlanPolicyToggles,
} from '../../types/catalog';
import { PlanModal } from '../../components/admin/PlanModal';
import {
  CalendarDays,
  Plus,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  PauseCircle,
  RotateCw,
  XCircle,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';

export const PlansPage: React.FC = () => {
  const { plans, deletePlan, togglePlanPolicy, products } = useCatalog();
  const { notify } = useNotification();

  const [selectedFreq, setSelectedFreq] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFreq = selectedFreq === 'all' || p.billingFrequency === selectedFreq;
      return matchesSearch && matchesFreq;
    });
  }, [plans, searchTerm, selectedFreq]);

  const handleDelete = (plan: SubscriptionPlan) => {
    if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      deletePlan(plan.id);
      notify('info', 'Plan Removed', `Removed plan "${plan.name}".`);
    }
  };

  const handleToggle = (plan: SubscriptionPlan, key: keyof PlanPolicyToggles) => {
    togglePlanPolicy(plan.id, key);
    const keyLabels: Record<keyof PlanPolicyToggles, string> = {
      autoCloseOnExpiration: 'Closes on its own',
      allowPause: 'Can be paused',
      allowRenewal: 'Can be renewed',
      allowEarlyClosure: 'Can be closed early',
    };
    notify(
      'info',
      'Policy Updated',
      `Toggled "${keyLabels[key]}" to ${!plan.policies[key] ? 'ENABLED' : 'DISABLED'} for ${plan.name}.`
    );
  };

  const frequencyBadges: Record<BillingFrequency, { label: string; color: string }> = {
    daily: { label: 'Daily Recurrence', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    weekly: { label: 'Weekly Cadence', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    monthly: { label: 'Monthly Term', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    yearly: { label: 'Annual Commitment', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subscription Plans</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure recurrence cadence, minimum order quantities, availability dates, and lifecycle policy toggles
          </p>
        </div>

        <button
          onClick={() => {
            setPlanToEdit(null);
            setIsPlanModalOpen(true);
          }}
          className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Filter and Cadence Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plans by name or code..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Cadence Selectors: Daily, Weekly, Monthly, Yearly */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFreq('all')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFreq === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Frequencies ({plans.length})
          </button>
          <button
            onClick={() => setSelectedFreq('daily')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFreq === 'daily'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setSelectedFreq('weekly')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFreq === 'weekly'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setSelectedFreq('monthly')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFreq === 'monthly'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedFreq('yearly')}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFreq === 'yearly'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredPlans.length === 0 ? (
          <div className="lg:col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-medium">No subscription plans found matching criteria.</p>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const bundledProducts = products.filter((p) =>
              plan.associatedProductIds.includes(p.id)
            );

            return (
              <div
                key={plan.id}
                className="hover-lift card-shine bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border badge-interactive ${
                            frequencyBadges[plan.billingFrequency].color
                          }`}
                        >
                          {frequencyBadges[plan.billingFrequency].label}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {plan.code}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {plan.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setPlanToEdit(plan);
                          setIsPlanModalOpen(true);
                        }}
                        className="btn-tactile p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan)}
                        className="btn-tactile p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {plan.description || 'Configured recurring subscription package for Brightloop subscribers.'}
                  </p>
                </div>

                {/* Key Plan Metrics: Price, Min Qty, Availability Dates */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Base Price</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ${plan.basePrice.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        /{plan.billingFrequency.slice(0, 2)}
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Min Quantity</span>
                    <span className="font-bold text-indigo-700">
                      {plan.minimumQuantity} {plan.minimumQuantity > 1 ? 'Units' : 'Unit'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Availability Window</span>
                    <span className="font-mono text-[11px] text-slate-600 block truncate" title={`${plan.availabilityStartDate} to ${plan.availabilityEndDate}`}>
                      {plan.availabilityStartDate} → {plan.availabilityEndDate}
                    </span>
                  </div>
                </div>

                {/* Core Policy Toggles (Interactive directly on Card!) */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <span>Lifecycle Governance Policies</span>
                    <span className="text-[10px] text-indigo-600 font-semibold lowercase">
                      (click to toggle)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Toggle: Closes on its own */}
                    <button
                      type="button"
                      onClick={() => handleToggle(plan, 'autoCloseOnExpiration')}
                      className={`btn-tactile p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        plan.policies.autoCloseOnExpiration
                          ? 'bg-purple-50 border-purple-200 text-purple-900'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title="Dictate if the plan closes on its own upon expiry"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-semibold">Closes on its own</span>
                      </div>
                      {plan.policies.autoCloseOnExpiration ? (
                        <ToggleRight className="w-5 h-5 text-purple-600 shrink-0" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                    </button>

                    {/* Toggle: Can be paused */}
                    <button
                      type="button"
                      onClick={() => handleToggle(plan, 'allowPause')}
                      className={`btn-tactile p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        plan.policies.allowPause
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title="Dictate if the plan can be paused"
                    >
                      <div className="flex items-center gap-2">
                        <PauseCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-semibold">Can be paused</span>
                      </div>
                      {plan.policies.allowPause ? (
                        <ToggleRight className="w-5 h-5 text-blue-600 shrink-0" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                    </button>

                    {/* Toggle: Can be renewed */}
                    <button
                      type="button"
                      onClick={() => handleToggle(plan, 'allowRenewal')}
                      className={`btn-tactile p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        plan.policies.allowRenewal
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title="Dictate if the plan can be renewed"
                    >
                      <div className="flex items-center gap-2">
                        <RotateCw className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-semibold">Can be renewed</span>
                      </div>
                      {plan.policies.allowRenewal ? (
                        <ToggleRight className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                    </button>

                    {/* Toggle: Can be closed early */}
                    <button
                      type="button"
                      onClick={() => handleToggle(plan, 'allowEarlyClosure')}
                      className={`btn-tactile p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        plan.policies.allowEarlyClosure
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title="Dictate if the plan can be closed early"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-semibold">Can be closed early</span>
                      </div>
                      {plan.policies.allowEarlyClosure ? (
                        <ToggleRight className="w-5 h-5 text-amber-600 shrink-0" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Associated Products */}
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Bundled Catalog Items:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bundledProducts.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No products assigned</span>
                    ) : (
                      bundledProducts.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium badge-interactive"
                        >
                          {p.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Plan Modal */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setPlanToEdit(null);
        }}
        planToEdit={planToEdit}
      />
    </div>
  );
};
