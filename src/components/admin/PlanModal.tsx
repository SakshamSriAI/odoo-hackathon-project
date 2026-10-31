import React, { useState, useEffect } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import {
  SubscriptionPlan,
  BillingFrequency,
  PlanPolicyToggles,
} from '../../types/catalog';
import {
  X,
  Plus,
  CalendarDays,
  Calendar,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  ShieldCheck,
  Clock,
  RotateCw,
  PauseCircle,
  XCircle,
} from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: SubscriptionPlan | null;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
}) => {
  const { addPlan, updatePlan, products } = useCatalog();
  const { notify } = useNotification();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  const [minimumQuantity, setMinimumQuantity] = useState<number>(1);
  const [basePrice, setBasePrice] = useState<number>(950);
  const [availabilityStartDate, setAvailabilityStartDate] = useState('2025-01-01');
  const [availabilityEndDate, setAvailabilityEndDate] = useState('2026-12-31');
  const [associatedProductIds, setAssociatedProductIds] = useState<string[]>([]);

  // 4 Core Policy Toggles required by prompt
  const [policies, setPolicies] = useState<PlanPolicyToggles>({
    autoCloseOnExpiration: false, // Closes on its own
    allowPause: true,             // Can be paused
    allowRenewal: true,           // Can be renewed
    allowEarlyClosure: true,      // Can be closed early
  });

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name);
      setCode(planToEdit.code);
      setDescription(planToEdit.description);
      setBillingFrequency(planToEdit.billingFrequency);
      setMinimumQuantity(planToEdit.minimumQuantity);
      setBasePrice(planToEdit.basePrice);
      setAvailabilityStartDate(planToEdit.availabilityStartDate);
      setAvailabilityEndDate(planToEdit.availabilityEndDate);
      setPolicies(planToEdit.policies);
      setAssociatedProductIds(planToEdit.associatedProductIds);
    } else {
      setName('');
      setCode(`BL-PLAN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
      setDescription('');
      setBillingFrequency('monthly');
      setMinimumQuantity(1);
      setBasePrice(1200);
      setAvailabilityStartDate(new Date().toISOString().split('T')[0]);
      // Default 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setAvailabilityEndDate(nextYear.toISOString().split('T')[0]);
      setPolicies({
        autoCloseOnExpiration: false,
        allowPause: true,
        allowRenewal: true,
        allowEarlyClosure: true,
      });
      setAssociatedProductIds(products.slice(0, 2).map((p) => p.id));
    }
  }, [planToEdit, isOpen, products]);

  if (!isOpen) return null;

  const handleTogglePolicy = (key: keyof PlanPolicyToggles) => {
    setPolicies((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProductToggle = (productId: string) => {
    setAssociatedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Quick date presets
  const applyDatePreset = (months: number) => {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + months);
    setAvailabilityStartDate(start.toISOString().split('T')[0]);
    setAvailabilityEndDate(end.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notify('error', 'Name Required', 'Please enter a plan name.');
      return;
    }
    if (minimumQuantity < 1) {
      notify('error', 'Invalid Quantity', 'Minimum quantity must be at least 1.');
      return;
    }

    if (planToEdit) {
      updatePlan(planToEdit.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        billingFrequency,
        minimumQuantity,
        basePrice,
        availabilityStartDate,
        availabilityEndDate,
        policies,
        associatedProductIds,
      });
      notify('success', 'Plan Updated', `Successfully updated plan "${name}".`);
    } else {
      addPlan({
        name: name.trim(),
        code: code.trim().toUpperCase() || 'BL-PLAN-NEW',
        description: description.trim(),
        billingFrequency,
        minimumQuantity,
        basePrice,
        availabilityStartDate,
        availabilityEndDate,
        policies,
        associatedProductIds,
        status: 'active',
      });
      notify(
        'success',
        'Plan Created',
        `Successfully registered "${name}" with ${billingFrequency.toUpperCase()} recurrence.`
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors animate-modal-pop">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {planToEdit ? 'Configure Subscription Plan' : 'Create New Subscription Plan'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set billing frequency, minimum quantities, date pickers, and lifecycle policies
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="plan-name">
                Plan Name *
              </label>
              <input
                id="plan-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Cloud Annual Suite"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="plan-code">
                Plan Code / Identifier
              </label>
              <input
                id="plan-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="BL-ENT-YR"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Billing Frequency Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Billing Recurrence Frequency *
              </label>
              <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Billing Cadence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['daily', 'weekly', 'monthly', 'yearly'] as BillingFrequency[]).map((freq) => {
                const isSelected = billingFrequency === freq;
                return (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setBillingFrequency(freq)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">{freq}</span>
                      <CalendarDays
                        className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {freq === 'daily' && '24-hour cycle'}
                      {freq === 'weekly' && '7-day cadence'}
                      {freq === 'monthly' && '30-day term'}
                      {freq === 'yearly' && 'Annual commitment'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Minimum Quantity Input (Phase 2 Requirement) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="plan-min-qty">
                Minimum Order Quantity (Seats / Units) *
              </label>
              <input
                id="plan-min-qty"
                type="number"
                min="1"
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Minimum seats required to subscribe to this plan</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="plan-base-price">
                Base Recurring Amount ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="plan-base-price"
                  type="number"
                  min="0"
                  step="5"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Billed per cadence per minimum commitment</p>
            </div>
          </div>

          {/* Availability Date Pickers (Phase 2 Requirement) */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Availability Date Windows</span>
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyDatePreset(3)}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium"
                >
                  90 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(12)}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium"
                >
                  1 Year
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(24)}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium"
                >
                  2 Years
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1" htmlFor="plan-start-date">
                  Availability Start Date:
                </label>
                <input
                  id="plan-start-date"
                  type="date"
                  value={availabilityStartDate}
                  onChange={(e) => setAvailabilityStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1" htmlFor="plan-end-date">
                  Availability End / Expiry Date:
                </label>
                <input
                  id="plan-end-date"
                  type="date"
                  value={availabilityEndDate}
                  onChange={(e) => setAvailabilityEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Policy Toggles (Phase 2 Requirement: Closes on its own, Pause, Renew, Close early) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Plan Lifecycle & Governance Policy Toggles
                </h4>
                <p className="text-[11px] text-slate-500">
                  Dictate how active subscriptions behave across term completion and customer controls
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                Policy Governance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Toggle 1: Closes on its own */}
              <div
                onClick={() => handleTogglePolicy('autoCloseOnExpiration')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  policies.autoCloseOnExpiration
                    ? 'border-indigo-300 bg-indigo-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Clock className={`w-4 h-4 mt-0.5 ${policies.autoCloseOnExpiration ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Closes on its own</div>
                    <div className="text-[11px] text-slate-500">
                      Auto-terminates upon expiration date
                    </div>
                  </div>
                </div>
                <button type="button" className="text-indigo-600">
                  {policies.autoCloseOnExpiration ? (
                    <ToggleRight className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Toggle 2: Can be paused */}
              <div
                onClick={() => handleTogglePolicy('allowPause')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  policies.allowPause
                    ? 'border-indigo-300 bg-indigo-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <PauseCircle className={`w-4 h-4 mt-0.5 ${policies.allowPause ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Can be paused</div>
                    <div className="text-[11px] text-slate-500">
                      Allows temporary freeze of billing
                    </div>
                  </div>
                </div>
                <button type="button" className="text-indigo-600">
                  {policies.allowPause ? (
                    <ToggleRight className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Toggle 3: Can be renewed */}
              <div
                onClick={() => handleTogglePolicy('allowRenewal')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  policies.allowRenewal
                    ? 'border-indigo-300 bg-indigo-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <RotateCw className={`w-4 h-4 mt-0.5 ${policies.allowRenewal ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Can be renewed</div>
                    <div className="text-[11px] text-slate-500">
                      Eligible for automated recurring renewal
                    </div>
                  </div>
                </div>
                <button type="button" className="text-indigo-600">
                  {policies.allowRenewal ? (
                    <ToggleRight className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Toggle 4: Can be closed early */}
              <div
                onClick={() => handleTogglePolicy('allowEarlyClosure')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  policies.allowEarlyClosure
                    ? 'border-indigo-300 bg-indigo-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <XCircle className={`w-4 h-4 mt-0.5 ${policies.allowEarlyClosure ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Can be closed early</div>
                    <div className="text-[11px] text-slate-500">
                      Permits early cancellation / termination
                    </div>
                  </div>
                </div>
                <button type="button" className="text-indigo-600">
                  {policies.allowEarlyClosure ? (
                    <ToggleRight className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Associated Catalog Products */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bundled Catalog Products Included in Plan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {products.map((prod) => {
                const isIncluded = associatedProductIds.includes(prod.id);
                return (
                  <label
                    key={prod.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isIncluded
                        ? 'border-indigo-300 bg-indigo-50/80 text-indigo-900 font-medium'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={() => handleProductToggle(prod.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{prod.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{planToEdit ? 'Save Plan Configuration' : 'Create Subscription Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
