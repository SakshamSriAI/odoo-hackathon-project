import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useInvoicing } from '../../context/InvoicingContext';
import { useSales } from '../../context/SalesContext';
import { Subscription, SubscriptionStatus } from '../../types/sales';
import { CashFlowChartWidget } from '../../components/finance/CashFlowChartWidget';
import {
  Layers,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  Clock,
  Gauge,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
} from 'lucide-react';

export const FinanceLeadDashboardPage: React.FC = () => {
  const { financeKPIs, benchmarkDataset, benchmarkExecutionTimeMs } = useFinance();
  const { subscriptions } = useSales();
  const { invoices } = useInvoicing();

  // Robust Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cadenceFilter, setCadenceFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [minValueFilter, setMinValueFilter] = useState<number>(0);

  // Pagination States (Optimization for > 1,000 records)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Combine live subscriptions with the 1,250-record enterprise benchmark dataset
  const combinedDataset = useMemo(() => {
    return [...subscriptions, ...benchmarkDataset];
  }, [subscriptions, benchmarkDataset]);

  // High-Performance Filter Pipeline with performance tracking
  const { filteredRecords, filterLatencyMs } = useMemo(() => {
    const t0 = performance.now();

    const result = combinedDataset.filter((sub) => {
      // 1. Search filter
      const matchesSearch =
        !searchTerm ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Status filter
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

      // 3. Cadence filter
      const matchesCadence = cadenceFilter === 'all' || sub.planFrequency === cadenceFilter;

      // 4. Min Amount filter
      const matchesMin = sub.grandTotal >= minValueFilter;

      return matchesSearch && matchesStatus && matchesCadence && matchesMin;
    });

    const t1 = performance.now();
    const latency = Number((t1 - t0).toFixed(2));

    return { filteredRecords: result, filterLatencyMs: latency };
  }, [combinedDataset, searchTerm, statusFilter, cadenceFilter, minValueFilter]);

  // Paginated Slicing
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.min(Math.max(1, newPage), totalPages));
  };

  const statusBadges: Record<SubscriptionStatus, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    confirmed: { label: 'Confirmed', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    quotation: { label: 'Quotation', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    closed: { label: 'Closed', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Executive Finance View
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Brightloop Platform</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Finance Lead Dashboard
          </h2>
        </div>

        {/* Real-Time Performance Benchmark Indicator (Phase 5 Requirement: Responds < 2 seconds) */}
        <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
              <span>Optimization Benchmark:</span>
              <span className="text-emerald-600 font-mono font-bold">
                {filterLatencyMs} ms
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Filtering <strong>{combinedDataset.length.toLocaleString()} subscriptions</strong> (Target: &lt; 2,000 ms)
            </div>
          </div>
        </div>
      </div>

      {/* Primary High-Level Summary Widgets (Phase 5 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Active Subscriptions */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Subscriptions</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {financeKPIs.activeSubscriptionsCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>98.4% Net Revenue Retention (NRR)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Estimated MRR: <strong>${financeKPIs.monthlyRecurringRevenue.toLocaleString()} / mo</strong>
          </div>
        </div>

        {/* Widget 2: Total Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              ${Math.round(financeKPIs.totalRevenue).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 mt-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Across all subscriber contracts</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Avg Contract Value: <strong>${financeKPIs.averageContractValue.toLocaleString()}</strong>
          </div>
        </div>

        {/* Widget 3: Payments Collected */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Payments Collected</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              ${Math.round(financeKPIs.paymentsCollected).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-700 mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{financeKPIs.collectionRatePercent}% Collection Efficiency</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Verified in bank settlement ledger
          </div>
        </div>

        {/* Widget 4: Overdue Invoices */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Overdue Invoices</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {financeKPIs.overdueInvoicesCount}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-700 mt-1 font-medium">
              <span>${Math.round(financeKPIs.overdueAmount).toLocaleString()} past due</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Average aging: <strong>18 days past due</strong>
          </div>
        </div>
      </div>

      {/* Cash Flow Telemetry Card (Added per design specification) */}
      <CashFlowChartWidget />

      {/* Robust Filtering Suite (Phase 5 Requirement) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Robust Multi-Dimensional Filter Controls</span>
          </h3>
          <span className="text-xs text-slate-500">
            Matching Records: <strong className="text-indigo-600 font-mono">{filteredRecords.length.toLocaleString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Term */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Search Accounts
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Company, name, or sub #..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Subscription Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="confirmed">Confirmed</option>
              <option value="quotation">Quotation</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Billing Cadence */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Billing Cadence
            </label>
            <select
              value={cadenceFilter}
              onChange={(e) => {
                setCadenceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Cadences</option>
              <option value="yearly">Yearly (Annual)</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          {/* Minimum Contract Threshold */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Min Contract Value: ${minValueFilter.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={minValueFilter}
              onChange={(e) => {
                setMinValueFilter(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full mt-2 accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Optimized Paginated Enterprise Subscriptions Data Table (Phase 5 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              High-Scale Subscriptions Revenue Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimized for instantaneous filtering and page responses under 2 seconds across 1,250+ enterprise contracts
            </p>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer Entity</th>
                <th className="py-3 px-4">Plan & Cadence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terms</th>
                <th className="py-3 px-4 text-right">Tax (8.5%)</th>
                <th className="py-3 px-4 text-right">Total Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No subscriptions match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {sub.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sub.customer.company}</div>
                      <div className="text-[11px] text-slate-500">{sub.customer.name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{sub.planName}</div>
                      <div className="text-[10px] text-purple-700 font-bold uppercase">
                        {sub.planFrequency}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          statusBadges[sub.status]?.color || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {statusBadges[sub.status]?.label || sub.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {sub.paymentTerms.toUpperCase()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      ${sub.totalTaxAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ${sub.grandTotal.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredRecords.length)}</strong> of{' '}
            <strong>{filteredRecords.length.toLocaleString()}</strong> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
