import React, { useState, useEffect } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import { Product, ProductType } from '../../types/catalog';
import { X, Plus, Sparkles, Tag, DollarSign, Calculator, Layers, Info } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {productToEdit ? 'Edit Product Catalog Item' : 'Create New Catalog Product'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure product details, pricing, brand variant markups, and internal notes
            </p>
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
          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-name">
                Product Name *
              </label>
              <input
                id="prod-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brightloop Distributed Runtime"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-sku">
                SKU Prefix
              </label>
              <input
                id="prod-sku"
                type="text"
                value={skuPrefix}
                onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                placeholder="BL-RUNTIME"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Category / Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-sales-price">
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default catalog price charged to subscribers</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-cost-price">
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Direct infrastructure or licensing COGS</p>
            </div>
          </div>

          {/* Real-time Base Margin Indicator */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Base Gross Margin:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900">${baseMarginDollars.toLocaleString()} / unit</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold ${
                  baseMarginPercent >= 50
                    ? 'bg-emerald-100 text-emerald-800'
                    : baseMarginPercent >= 20
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {baseMarginPercent}% margin
              </span>
            </div>
          </div>

          {/* Brand Variant Markup Selector (Phase 2 Requirement) */}
          {!productToEdit && (
            <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBrandVariant}
                    onChange={(e) => setIncludeBrandVariant(e.target.checked)}
                    className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Create Brand Variant with Dynamic Markup (e.g. +$560)
                  </span>
                </label>
                <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                  Phase 2 Feature
                </span>
              </div>

              {includeBrandVariant && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Brand Markup Tier:
                    </label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      {brandMarkups.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name} — Adds +${brand.markupAmount.toLocaleString()} to Base Price ({brand.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Markup Calculation Box */}
                  <div className="p-3 bg-white rounded-lg border border-indigo-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Base Sales Price:</span>
                      <span className="font-mono font-medium">${salesPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-indigo-700 font-semibold">
                      <span>+ {currentBrand.name} Markup:</span>
                      <span className="font-mono text-indigo-600">+${brandMarkupAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between font-bold text-slate-900">
                      <span>Calculated Variant Sales Price:</span>
                      <span className="font-mono text-sm text-indigo-700">
                        ${variantFinalSalesPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium">
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-notes">
              Internal Product Notes & Specifications
            </label>
            <textarea
              id="prod-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add SLA specifications, minimum contract terms, compatibility requirements, or provision guidelines..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{productToEdit ? 'Save Changes' : 'Create Catalog Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
