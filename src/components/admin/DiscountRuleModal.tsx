import React, { useState, useEffect } from 'react';
import { useInvoicing } from '../../context/InvoicingContext';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import { DiscountRule, DiscountType } from '../../types/invoicing';
import {
  X,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Calculator,
  Layers,
  Tag,
  Hash,
} from 'lucide-react';

interface DiscountRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit?: DiscountRule | null;
}

export const DiscountRuleModal: React.FC<DiscountRuleModalProps> = ({
  isOpen,
  onClose,
  ruleToEdit,
}) => {
  const { addDiscountRule, updateDiscountRule } = useInvoicing();
  const { products } = useCatalog();
  const { notify } = useNotification();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState<number>(15);
  const [minimumPurchaseQuantity, setMinimumPurchaseQuantity] = useState<number>(5);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(50);
  const [applicableProductIds, setApplicableProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (ruleToEdit) {
      setName(ruleToEdit.name);
      setCode(ruleToEdit.code);
      setDescription(ruleToEdit.description);
      setType(ruleToEdit.type);
      setValue(ruleToEdit.value);
      setMinimumPurchaseQuantity(ruleToEdit.minimumPurchaseQuantity);
      setStartDate(ruleToEdit.startDate);
      setEndDate(ruleToEdit.endDate);
      setUsageLimit(ruleToEdit.usageLimit);
      setApplicableProductIds(ruleToEdit.applicableProductIds);
    } else {
      setName('');
      setCode(`PROMO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
      setDescription('');
      setType('percentage');
      setValue(15);
      setMinimumPurchaseQuantity(5);
      setStartDate(new Date().toISOString().split('T')[0]);
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setEndDate(nextYear.toISOString().split('T')[0]);
      setUsageLimit(50);
      setApplicableProductIds(products.map((p) => p.id));
    }
  }, [ruleToEdit, isOpen, products]);

  if (!isOpen) return null;

  // Simulator calculation for order of 5 units @ $2,000 ($10,000 subtotal)
  const sampleOrderSubtotal = 10000;
  const sampleCalculatedDeduction =
    type === 'percentage'
      ? (sampleOrderSubtotal * value) / 100
      : Math.min(value, sampleOrderSubtotal);
  const sampleFinalTotal = sampleOrderSubtotal - sampleCalculatedDeduction;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notify('error', 'Name Required', 'Please enter a name for the discount rule.');
      return;
    }
    if (!code.trim()) {
      notify('error', 'Promo Code Required', 'Please provide a discount code.');
      return;
    }
    if (value <= 0) {
      notify('error', 'Invalid Value', 'Discount amount or percentage must be greater than 0.');
      return;
    }

    if (ruleToEdit) {
      updateDiscountRule(ruleToEdit.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        type,
        value,
        minimumPurchaseQuantity,
        startDate,
        endDate,
        usageLimit,
        applicableProductIds,
      });
      notify('success', 'Discount Rule Updated', `Updated discount rule ${name}.`);
    } else {
      addDiscountRule({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        type,
        value,
        minimumPurchaseQuantity,
        startDate,
        endDate,
        usageLimit,
        applicableProductIds,
      });
      notify(
        'success',
        'Discount Rule Created',
        `Configured "${name}" (${type === 'percentage' ? `${value}%` : `$${value}`} discount).`
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
                Phase 4 Feature
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Admin Discount Engine</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {ruleToEdit ? 'Configure Discount Rule' : 'Create New Discount Rule'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rule Name & Promo Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="disc-name">
                Rule Name *
              </label>
              <input
                id="disc-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Volume Tier Discount"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="disc-code">
                Discount Code *
              </label>
              <input
                id="disc-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENT-VOL-15"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:ring-2 focus:ring-amber-500 font-bold"
                required
              />
            </div>
          </div>

          {/* Discount Type Selector: Fixed Amount vs Percentage */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950">
                Discount Calculation Type & Magnitude *
              </label>
              <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Fixed or Percentage
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('percentage')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  type === 'percentage'
                    ? 'border-amber-600 bg-white text-amber-950 shadow-xs ring-1 ring-amber-500'
                    : 'border-amber-200 bg-amber-100/40 text-slate-600 hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Percentage Discount (%)</div>
                  <div className="text-[11px] text-slate-500">e.g. 10%, 15%, 20% off</div>
                </div>
                <Percent className={`w-5 h-5 ${type === 'percentage' ? 'text-amber-600' : 'text-slate-400'}`} />
              </button>

              <button
                type="button"
                onClick={() => setType('fixed')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  type === 'fixed'
                    ? 'border-amber-600 bg-white text-amber-950 shadow-xs ring-1 ring-amber-500'
                    : 'border-amber-200 bg-amber-100/40 text-slate-600 hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Fixed Amount ($ USD)</div>
                  <div className="text-[11px] text-slate-500">e.g. $500, $1,200 flat off</div>
                </div>
                <DollarSign className={`w-5 h-5 ${type === 'fixed' ? 'text-amber-600' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Discount Value Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="disc-val">
                {type === 'percentage' ? 'Percentage Value (%):' : 'Fixed Deduction Amount ($ USD):'}
              </label>
              <div className="relative">
                {type === 'percentage' ? (
                  <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                ) : (
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
                <input
                  id="disc-val"
                  type="number"
                  min="1"
                  max={type === 'percentage' ? 100 : undefined}
                  step={type === 'percentage' ? 1 : 10}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Minimum Purchase Quantities & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="disc-min-qty">
                Minimum Purchase Quantity *
              </label>
              <input
                id="disc-min-qty"
                type="number"
                min="1"
                value={minimumPurchaseQuantity}
                onChange={(e) =>
                  setMinimumPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Threshold of items required in order to trigger discount
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="disc-usage-limit">
                Limit Usage Count (Max Redemptions) *
              </label>
              <input
                id="disc-usage-limit"
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Global redemption cap across all subscribers
              </p>
            </div>
          </div>

          {/* Start and End Availability Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="disc-start-date">
                Effective Start Date *
              </label>
              <input
                id="disc-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="disc-end-date">
                Effective Expiry End Date *
              </label>
              <input
                id="disc-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          {/* Real-time Calculation Simulator Preview */}
          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>Simulated Discount Impact (Sample $10,000 Order)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Standard Qualifying Subtotal:</span>
              <span className="font-mono font-medium">${sampleOrderSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-amber-700 font-bold">
              <span>
                Discount Applied ({type === 'percentage' ? `${value}%` : `$${value} Fixed`}):
              </span>
              <span className="font-mono">-${sampleCalculatedDeduction.toLocaleString()}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
              <span>Payable After Discount:</span>
              <span className="font-mono text-emerald-700 font-bold">
                ${sampleFinalTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{ruleToEdit ? 'Save Changes' : 'Activate Discount Rule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
