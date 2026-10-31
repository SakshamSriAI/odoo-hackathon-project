import React, { useState, useEffect } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import { Product, ProductType } from '../../types/catalog';
import { X, Plus, Sparkles, DollarSign, Calculator } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, brandMarkups } = useCatalog();
  const { notify } = useNotification();

  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('software_license');
  const [salesPrice, setSalesPrice] = useState<number>(1200);
  const [costPrice, setCostPrice] = useState<number>(450);
  const [notes, setNotes] = useState('');
  const [skuPrefix, setSkuPrefix] = useState('BL-PROD');

  // Variant Brand selector state
  const [includeBrandVariant, setIncludeBrandVariant] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    brandMarkups[0]?.id || 'brand_prime'
  );

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setType(productToEdit.type);
      setSalesPrice(productToEdit.salesPrice);
      setCostPrice(productToEdit.costPrice);
      setNotes(productToEdit.notes);
      setSkuPrefix(productToEdit.skuPrefix);
      setIncludeBrandVariant(false);
    } else {
      setName('');
      setType('software_license');
      setSalesPrice(1200);
      setCostPrice(450);
      setNotes('');
      setSkuPrefix(`BL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
      setIncludeBrandVariant(true);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Selected brand for markup preview
  const currentBrand = brandMarkups.find((b) => b.id === selectedBrandId) || brandMarkups[0];
  const brandMarkupAmount = currentBrand ? currentBrand.markupAmount : 560;

  // Real-time calculations
  const baseMarginDollars = salesPrice - costPrice;
  const baseMarginPercent =
    salesPrice > 0 ? Number(((baseMarginDollars / salesPrice) * 100).toFixed(1)) : 0;

  const variantFinalSalesPrice = salesPrice + brandMarkupAmount;
  const variantMarginDollars = variantFinalSalesPrice - costPrice;
  const variantMarginPercent =
    variantFinalSalesPrice > 0
      ? Number(((variantMarginDollars / variantFinalSalesPrice) * 100).toFixed(1))
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notify('error', 'Product Name Required', 'Please provide a name for this product.');
      return;
    }
    if (salesPrice <= 0) {
      notify('error', 'Invalid Sales Price', 'Sales price must be greater than $0.');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name: name.trim(),
        type,
        salesPrice,
        costPrice,
        notes: notes.trim(),
        skuPrefix: skuPrefix.trim() || 'BL-PROD',
      });
      notify('success', 'Product Updated', `Successfully updated ${name}.`);
    } else {
      addProduct(
        {
          name: name.trim(),
          type,
          salesPrice,
          costPrice,
          notes: notes.trim(),
          skuPrefix: skuPrefix.trim() || 'BL-PROD',
          status: 'active',
        },
        includeBrandVariant ? selectedBrandId : undefined
      );
      notify(
        'success',
        'Product Created',
        `Added "${name}" with ${includeBrandVariant ? `${currentBrand.name} (+560)` : 'base configuration'}.`
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {productToEdit ? 'Edit Product Catalog Item' : 'Create New Catalog Product'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure product details, pricing, brand variant markups, and internal notes
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="prod-name">
                Product Name *
              </label>
              <input
                id="prod-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brightloop Distributed Runtime"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="prod-sku">
                SKU Prefix
              </label>
              <input
                id="prod-sku"
                type="text"
                value={skuPrefix}
                onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                placeholder="BL-RUNTIME"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Product Category / Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="software_license">Software License (Core Enterprise Seat)</option>
              <option value="subscription_service">Subscription Service (Recurring SaaS Service)</option>
              <option value="cloud_addon">Cloud Addon (API, Connector, Storage)</option>
              <option value="support_tier">Dedicated Support Tier (SLA & 24/7 Ops)</option>
              <option value="hardware_device">Hardware Appliance / Security Key</option>
            </select>
          </div>

          {/* Pricing: Sales Price & Cost Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="prod-sales-price">
                Base Sales Price ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="prod-sales-price"
                  type="number"
                  min="0"
                  step="10"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Default catalog price charged to subscribers</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="prod-cost-price">
                Cost Price ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="prod-cost-price"
                  type="number"
                  min="0"
                  step="10"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Direct infrastructure or licensing COGS</p>
            </div>
          </div>

          {/* Real-time Base Margin Indicator */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium">Base Gross Margin:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 dark:text-white">${baseMarginDollars.toLocaleString()} / unit</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold ${
                  baseMarginPercent >= 50
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : baseMarginPercent >= 20
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                }`}
              >
                {baseMarginPercent}% margin
              </span>
            </div>
          </div>

          {/* Brand Variant Markup Selector */}
          {!productToEdit && (
            <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBrandVariant}
                    onChange={(e) => setIncludeBrandVariant(e.target.checked)}
                    className="rounded border-indigo-300 dark:border-indigo-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Create Brand Variant with Dynamic Markup (e.g. +$560)
                  </span>
                </label>
                <span className="text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60">
                  Dynamic Tier
                </span>
              </div>

              {includeBrandVariant && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Select Brand Markup Tier:
                    </label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      {brandMarkups.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name} — Adds +${brand.markupAmount.toLocaleString()} to Base Price ({brand.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Markup Calculation Box */}
                  <div className="p-3 bg-white dark:bg-slate-900/90 rounded-lg border border-indigo-200/80 dark:border-indigo-800/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Base Sales Price:</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-200">${salesPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-semibold">
                      <span>+ {currentBrand.name} Markup:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">+${brandMarkupAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Calculated Variant Sales Price:</span>
                      <span className="font-mono text-sm text-indigo-700 dark:text-indigo-300">
                        ${variantFinalSalesPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      <span>Upgraded Variant Gross Margin:</span>
                      <span>
                        ${variantMarginDollars.toLocaleString()} ({variantMarginPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="prod-notes">
              Internal Product Notes & Specifications
            </label>
            <textarea
              id="prod-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add SLA specifications, minimum contract terms, compatibility requirements, or provision guidelines..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{productToEdit ? 'Save Changes' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
