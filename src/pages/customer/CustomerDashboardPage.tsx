import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, sanitizeName } from '../../context/AuthContext';
import {
  Building2,
  ShieldCheck,
  Calendar,
  CreditCard,
  Receipt,
  Layers,
  Clock,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const orgName = user?.organization || 'Acme Technologies Inc.';
  const displayName = sanitizeName(user?.name) || 'Subscriber';

  return (
    <div className="space-y-6">
      {/* 1. Professional Executive Customer Banner */}
      <div className="p-7 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Brightloop Enterprise Client Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {displayName}
          </h2>

          <p className="text-emerald-100/90 text-sm mt-2 leading-relaxed max-w-2xl">
            Access and manage your enterprise subscriptions, view transparent billing schedules, retrieve official tax receipts, and configure payment profiles.
          </p>
        </div>

        {/* Professional Enterprise Metadata Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 relative z-10 text-xs">
          {/* Organization Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-200/80 font-medium">Organization:</span>
            <span className="font-semibold text-white">{orgName}</span>
          </div>

          {/* Plan Tier Status */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-white shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold text-emerald-100">Enterprise Plan • Active & Verified</span>
          </div>

          {/* Account ID */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs">
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-200/80 font-medium">Client ID:</span>
            <span className="font-mono font-semibold text-white">BL-CUST-8892</span>
          </div>

          {/* Billing Cycle */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-200/80 font-medium">Billing Term:</span>
            <span className="font-semibold text-white">Net 30 Automated</span>
          </div>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Licenses</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">2 Subscriptions</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>All services online & operational</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Next Billing Event</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">Nov 01, 2026</div>
          <div className="text-xs text-slate-500 mt-1.5">
            API Integration Pack • Auto-debit scheduled
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Default Payment Method</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">Visa •••• 4242</div>
          <div className="text-xs text-slate-500 mt-1.5">
            Acme Corporate Card • Expires 12/28
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub - Replacing raw subscription list with clean portal access */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Enterprise Portal Quick Navigation</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quickly jump to dedicated areas to manage plans, download invoices, or update billing credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Active Plans */}
          <Link
            to="/customer/subscriptions"
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Active Plans & Licenses
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Inspect dedicated plan tiers, allocated seat quantities, renewal policies, and cancellation safeguards.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
              <span>View 2 active plans</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Invoices & Receipts */}
          <Link
            to="/customer/invoices"
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Invoices & Tax Receipts
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Download certified accounting PDFs, review itemized line deductions, and track automated payment receipts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
              <span>Browse billing history</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Payment Profile */}
          <Link
            to="/customer/payment-methods"
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Payment Profile & Cards
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage registered corporate credit cards, automated ACH routing, and corporate billing tax identifiers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>Manage payment methods</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
