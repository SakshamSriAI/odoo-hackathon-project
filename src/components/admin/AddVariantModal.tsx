import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import { Product } from '../../types/catalog';
import { X, Sparkles, Plus, DollarSign, Calculator } from 'lucide-react';

interface AddVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const AddVariantModal: React.FC<AddVariantModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { brandMarkups, addVariantToProduct } = useCatalog();
  const { notify } = useNotification();

  const [selectedBrandId, setSelectedBrandId] = useState(brandMarkups[0]?.id || 'brand_prime');
  const [customMarkup, setCustomMarkup] = useState<number | ''>('');
  const [variantNotes, setVariantNotes] = useState('');

  if (!isOpen || !product) return null;

  const currentBrand = brandMarkups.find((b) => b.id === selectedBrandId) || brandMarkups[0];
  const effectiveMarkup =
    customMarkup !== '' ? Number(customMarkup) : currentBrand ? currentBrand.markupAmount : 560;

  const finalSalesPrice = product.salesPrice + effectiveMarkup;
  const marginDollars = finalSalesPrice - product.costPrice;
  const marginPercent =
    finalSalesPrice > 0 ? Number(((marginDollars / finalSalesPrice) * 100).toFixed(1)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const added = addVariantToProduct(
      product.id,
      selectedBrandId,
      customMarkup !== '' ? Number(customMarkup) : undefined,
      variantNotes.trim()
    );

    if (added) {
      notify(
        'success',
        'Product Variant Added',
        `Generated variant "${added.variantLabel}" for ${product.name} (+$${effectiveMarkup} markup).`
      );
      onClose();
    } else {
      notify('error', 'Failed to Add Variant', 'Could not create variant.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Brand Product Variant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target Product: <strong className="text-indigo-600 dark:text-indigo-400">{product.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Brand Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Select Brand Variant Tier *
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                setCustomMarkup('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              {brandMarkups.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name} — Preset Markup: +${brand.markupAmount.toLocaleString()} ({brand.code})
                </option>
              ))}
            </select>
          </div>

          {/* Optional Override Markup */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Custom Markup Amount ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="10"
                value={customMarkup}
                onChange={(e) =>
                  setCustomMarkup(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder={`Leave blank to use preset +$${currentBrand.markupAmount}`}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Active Markup: <strong className="text-indigo-600 dark:text-indigo-400">+${effectiveMarkup}</strong>
            </p>
          </div>

          {/* Real-time Financial Preview Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Base Product Price:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">${product.salesPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-semibold">
              <span>Dynamic Variant Markup:</span>
              <span className="font-mono">+${effectiveMarkup.toLocaleString()}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>New Variant Sales Price:</span>
              <span className="font-mono text-indigo-700 dark:text-indigo-300 text-sm">${finalSalesPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <span>Variant Margin:</span>
              <span>
                ${marginDollars.toLocaleString()} ({marginPercent}%)
              </span>
            </div>
          </div>

          {/* Variant Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Variant Notes (Optional)
            </label>
            <input
              type="text"
              value={variantNotes}
              onChange={(e) => setVariantNotes(e.target.value)}
              placeholder="e.g. Includes dedicated 24/7 TAM routing"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Attach Variant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
