import React, { useState } from 'react';
import { useAuth, sanitizeName } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface MockSubscriptionItem {
  id: string;
  planName: string;
  cadence: 'Monthly' | 'Yearly';
  amount: number;
  periodLabel: string;
  status: 'Active' | 'Pending Renewal';
  startDate: string;
  renewalDate: string;
  autoRenew: boolean;
  seatsAllocated: number;
  productFeatures: string[];
}

export const CustomerSubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [subscriptions, setSubscriptions] = useState<MockSubscriptionItem[]>([
    {
      id: 'SUB-2026-0891',
      planName: 'Brightloop Enterprise Cloud Pro (Prime Edition)',
      cadence: 'Yearly',
      amount: 14400,
      periodLabel: '$14,400 / yr',
      status: 'Active',
      startDate: '2025-01-15',
      renewalDate: '2026-01-15',
      autoRenew: true,
      seatsAllocated: 50,
      productFeatures: [
        'Brightloop Cloud Orchestrator (Prime Edition +$560 markup)',
        'Real-Time Invoicing & Discount Engine',
        '24/7 Dedicated Technical Account Manager (TAM)',
        '99.99% Guaranteed SLA Uptime',
      ],
    },
    {
      id: 'SUB-2026-0412',
      planName: 'API Integration & Webhook Addon Pack',
      cadence: 'Monthly',
      amount: 350,
      periodLabel: '$350 / mo',
      status: 'Active',
      startDate: '2025-03-01',
      renewalDate: '2025-11-01',
      autoRenew: true,
      seatsAllocated: 10,
      productFeatures: [
        'High-Throughput Webhook Listeners',
        'ERP & Treasury Synchronizer Connector',
        'Custom OAuth2 Scopes',
      ],
    },
  ]);

  const toggleAutoRenew = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          const next = !s.autoRenew;
          notify(
            'info',
            'Auto-Renewal Preference Updated',
            `Subscription ${s.id} auto-renewal is now ${next ? 'enabled' : 'disabled'}.`
          );
          return { ...s, autoRenew: next };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2 Active Enterprise Licenses</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Current Subscription Commitments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered corporate software packages for {user?.organization || 'Acme Technologies Inc.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Total Annualized Run-Rate</div>
            <div className="text-xl font-extrabold text-slate-900">$18,600 / yr</div>
          </div>
        </div>
      </div>

      {/* Subscription Cards List */}
      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="hover-lift group bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all duration-300"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/60">
                    {sub.id}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{sub.status}</span>
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
                    Cadence: {sub.cadence}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{sub.planName}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{sub.periodLabel}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    Covers {sub.seatsAllocated} provisioned seats
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body & Feature Breakdown */}
            <div className="p-5 bg-slate-50/50 dark:bg-slate-900/40 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Feature list */}
              <div className="md:col-span-2 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Included Enterprise Entitlements
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sub.productFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule and policy settings */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Term & Lifecycle Policies
                </div>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Activated:</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{sub.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renewal Date:</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{sub.renewalDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Auto-Renewal:</span>
                  <button
                    onClick={() => toggleAutoRenew(sub.id)}
                    className={`btn-tactile px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sub.autoRenew
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    {sub.autoRenew ? 'Enabled (Active)' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
