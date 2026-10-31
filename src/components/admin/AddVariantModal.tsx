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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add Brand Product Variant</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Product: <strong className="text-indigo-600">{product.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Brand Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Brand Variant Tier *
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                setCustomMarkup('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Brand Markup Amount ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="10"
                placeholder={`Default: ${currentBrand?.markupAmount || 560}`}
                value={customMarkup}
                onChange={(e) =>
                  setCustomMarkup(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to use preset brand markup (+${currentBrand?.markupAmount || 560})
            </p>
          </div>

          {/* Markup Live Calculation Preview */}
          <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Variant Pricing Breakdown</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Base Product Sales Price:</span>
              <span className="font-mono font-medium">${product.salesPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-indigo-700 font-semibold">
              <span>+ Brand Markup:</span>
              <span className="font-mono">+${effectiveMarkup.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-indigo-200/80 flex items-center justify-between text-slate-900 font-bold">
              <span>Final Variant Sales Price:</span>
              <span className="font-mono text-sm text-indigo-700">
                ${finalSalesPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium">
              <span>Projected Margin:</span>
              <span>
                ${marginDollars.toLocaleString()} ({marginPercent}%)
              </span>
            </div>
          </div>

          {/* Variant Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Variant Notes (Optional)
            </label>
            <input
              type="text"
              value={variantNotes}
              onChange={(e) => setVariantNotes(e.target.value)}
              placeholder="e.g. Includes dedicated OEM telemetry channel..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Attach Brand Variant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
