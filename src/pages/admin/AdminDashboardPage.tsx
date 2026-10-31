import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, sanitizeName } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { useInvoicing } from '../../context/InvoicingContext';
import { ProductModal } from '../../components/admin/ProductModal';
import { PlanModal } from '../../components/admin/PlanModal';
import { DiscountRuleModal } from '../../components/admin/DiscountRuleModal';
import {
  Package,
  CalendarDays,
  Percent,
  Receipt,
  Users,
  ArrowUpRight,
  Sparkles,
  Plus,
  Layers,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products, plans, brandMarkups } = useCatalog();
  const { invoices, discountRules } = useInvoicing();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Computed stats
  const totalInvoicedAmount = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const paidInvoicesCount = invoices.filter((i) => i.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Brightloop Admin Portal • Enterprise Catalog, Billing & Invoicing Engine</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {sanitizeName(user?.name) || 'Administrator'}
          </h2>
          <p className="text-purple-200 text-sm mt-1 leading-relaxed">
            Manage your product catalog, configure brand variant markups, orchestrate subscription billing cadences, and govern automated invoicing and discount rules.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3 relative z-10 text-xs">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold hover:bg-purple-50 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Create Product</span>
          </button>

          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 border border-purple-400/40 text-white font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Plan</span>
          </button>

          <button
            onClick={() => setIsDiscountModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 border border-amber-400/40 text-white font-bold transition-colors cursor-pointer"
          >
            <Percent className="w-4 h-4" />
            <span>New Discount Rule</span>
          </button>

          <Link
            to="/admin/invoices"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Audit Invoices ({invoices.length})</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Catalog Products</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{products.length} Items</div>
          <div className="flex items-center gap-1 text-xs text-indigo-600 mt-1 font-medium">
            <span>{brandMarkups.length} brand markup tiers (+560)</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Subscription Plans</span>
            <CalendarDays className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{plans.length} Cadences</div>
          <div className="text-xs text-purple-600 mt-1 font-medium">
            Daily, Weekly, Monthly, Yearly
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Discount Rules</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{discountRules.length} Rules</div>
          <div className="text-xs text-amber-600 mt-1 font-medium">
            Fixed ($) & Percentage (%) tiers
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ${Math.round(totalInvoicedAmount).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">
            {paidInvoicesCount} settled invoices
          </div>
        </div>
      </div>

      {/* Two Column Layout: Discount Rules & Invoices Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discount Rules Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Discount Rules & Promos</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated volume discounts and onboarding incentives</p>
              </div>
              <Link
                to="/admin/discounts"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Manage all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {discountRules.slice(0, 3).map((rule) => (
                <div key={rule.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-amber-700 font-semibold">{rule.code}</span>
                      <span>•</span>
                      <span>Min {rule.minimumPurchaseQuantity} units</span>
                      <span>•</span>
                      <span>{rule.timesUsed}/{rule.usageLimit} redeemed</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.type === 'percentage'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {rule.type === 'percentage' ? `${rule.value}% Off` : `$${rule.value} Off`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsDiscountModalOpen(true)}
            className="w-full mt-4 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:border-amber-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Discount Rule</span>
          </button>
        </div>

        {/* Invoices Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Generated Invoices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pre-filled customer billing and automated taxes</p>
              </div>
              <Link
                to="/admin/invoices"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {invoices.slice(0, 3).map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">{inv.id}</span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'confirmed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {inv.customer.company}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      ${inv.grandTotal.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Due {inv.dueDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/admin/invoices"
            className="w-full mt-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-center"
          >
            <span>Open Invoices Ledger & Action Controls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
      <DiscountRuleModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
      />
    </div>
  );
};
