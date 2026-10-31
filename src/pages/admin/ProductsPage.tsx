import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import { Product, ProductType } from '../../types/catalog';
import { ProductModal } from '../../components/admin/ProductModal';
import { AddVariantModal } from '../../components/admin/AddVariantModal';
import {
  Package,
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, deleteProduct, brandMarkups } = useCatalog();
  const { notify } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skuPrefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [products, searchTerm, selectedType]);

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      notify('info', 'Product Removed', `Deleted "${product.name}" from catalog.`);
    }
  };

  const typeLabels: Record<ProductType, { label: string; color: string }> = {
    software_license: {
      label: 'Software License',
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    },
    subscription_service: {
      label: 'Subscription Service',
      color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    },
    cloud_addon: {
      label: 'Cloud Addon',
      color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
    },
    support_tier: {
      label: 'Support Tier',
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
    hardware_device: {
      label: 'Hardware Appliance',
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Products Catalog</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage base products, configure sales prices, cost basis, and brand variant markups
          </p>
        </div>

        <button
          onClick={() => {
            setProductToEdit(null);
            setIsProductModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Brand Markup Explainer Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Brand Variant Markup Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Dynamic Pricing
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Brand selectors dynamically calculate marked-up pricing on top of base sales prices (e.g. Brightloop Prime Edition markup adds exactly <strong>+$560</strong>).
            </p>
          </div>
        </div>

        {/* Brand Markup quick summary chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {brandMarkups.map((bm) => (
            <span
              key={bm.id}
              className="px-2.5 py-1 rounded-lg bg-white/10 dark:bg-white/5 border border-white/15 text-slate-200 text-[11px] font-medium"
            >
              {bm.name.split(' ')[1] || bm.name}: <strong className="text-indigo-300 font-mono">+${bm.markupAmount}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs transition-colors">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name, SKU, or keywords..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Product Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setSelectedType('software_license')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === 'software_license'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Software Licenses
          </button>
          <button
            onClick={() => setSelectedType('subscription_service')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === 'subscription_service'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Subscription Services
          </button>
          <button
            onClick={() => setSelectedType('cloud_addon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === 'cloud_addon'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Cloud Addons
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Cost Basis</th>
                <th className="py-3 px-4">Base Sales Price</th>
                <th className="py-3 px-4">Gross Margin</th>
                <th className="py-3 px-4">Brand Variants & Markups</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs text-slate-700 dark:text-slate-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No products match your criteria.</p>
                    <button
                      onClick={() => {
                        setProductToEdit(null);
                        setIsProductModalOpen(true);
                      }}
                      className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Create your first product
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const baseMarginDollars = prod.salesPrice - prod.costPrice;
                  const baseMarginPercent =
                    prod.salesPrice > 0
                      ? Number(((baseMarginDollars / prod.salesPrice) * 100).toFixed(1))
                      : 0;
                  const isNotesExpanded = expandedNotesId === prod.id;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 dark:text-white">{prod.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          SKU: {prod.skuPrefix}
                        </div>
                        {prod.notes && (
                          <div className="mt-1">
                            <button
                              onClick={() =>
                                setExpandedNotesId(isNotesExpanded ? null : prod.id)
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
                            >
                              <span>Notes</span>
                              {isNotesExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                            {isNotesExpanded && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mt-1 bg-slate-50 dark:bg-slate-900/90 p-2 rounded border border-slate-100 dark:border-slate-800 max-w-xs">
                                {prod.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            typeLabels[prod.type]?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {typeLabels[prod.type]?.label || prod.type}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 align-top font-mono font-medium text-slate-500 dark:text-slate-400">
                        ${prod.costPrice.toLocaleString()}
                      </td>

                      {/* Base Sales Price */}
                      <td className="py-3.5 px-4 align-top font-mono font-bold text-slate-900 dark:text-white">
                        ${prod.salesPrice.toLocaleString()}
                      </td>

                      {/* Margin */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          +${baseMarginDollars.toLocaleString()}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            baseMarginPercent >= 50
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60'
                              : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60'
                          }`}
                        >
                          {baseMarginPercent}% margin
                        </span>
                      </td>

                      {/* Variants & Markups */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        {prod.variants.length === 0 ? (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            No brand variants attached
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {prod.variants.map((v) => (
                              <div
                                key={v.id}
                                className="p-1.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-between text-[11px]"
                              >
                                <div>
                                  <span className="font-semibold text-indigo-950 dark:text-indigo-200">
                                    {v.brandName.split(' ')[0]} Edition
                                  </span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold ml-1">
                                    (+${v.markupAmount})
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">
                                  ${v.finalSalesPrice.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setVariantModalProduct(prod)}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Add Brand Variant Markup"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToEdit(prod);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      <AddVariantModal
        isOpen={!!variantModalProduct}
        onClose={() => setVariantModalProduct(null)}
        product={variantModalProduct}
      />
    </div>
  );
};
