import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, sanitizeName } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Box,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Receipt,
  Layers,
  CheckCircle2,
  Clock,
  ChevronDown,
  Zap,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface MonthlyData {
  month: string;
  subscriptions: number;
  revenue: number;
}

const MONTHLY_ANALYTICS: MonthlyData[] = [
  { month: 'Jan', subscriptions: 2, revenue: 6800 },
  { month: 'Feb', subscriptions: 2, revenue: 7200 },
  { month: 'Mar', subscriptions: 2, revenue: 8400 },
  { month: 'Apr', subscriptions: 2, revenue: 8100 },
  { month: 'May', subscriptions: 2, revenue: 9500 },
  { month: 'Jun', subscriptions: 2, revenue: 10200 },
  { month: 'Jul', subscriptions: 3, revenue: 12480 },
  { month: 'Aug', subscriptions: 2, revenue: 11100 },
  { month: 'Sep', subscriptions: 2, revenue: 11600 },
  { month: 'Oct', subscriptions: 2, revenue: 12800 },
  { month: 'Nov', subscriptions: 2, revenue: 13500 },
  { month: 'Dec', subscriptions: 2, revenue: 14400 },
];

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const displayName = sanitizeName(user?.name) || 'Emily Chen';
  const orgName = user?.organization || 'Acme Technologies Inc.';

  const [activeHoverIndex, setActiveHoverIndex] = useState<number>(6); // Default to July like reference image
  const [timeRange, setTimeRange] = useState<string>('Last 12 Months');

  const hoveredData = MONTHLY_ANALYTICS[activeHoverIndex] || MONTHLY_ANALYTICS[6];

  // SVG Chart Geometry calculations
  const chartWidth = 560;
  const chartHeight = 160;
  const maxRevenue = 16000;
  const maxSubs = 4;

  const points = MONTHLY_ANALYTICS.map((d, i) => {
    const x = 30 + (i * (chartWidth - 60)) / (MONTHLY_ANALYTICS.length - 1);
    const y = chartHeight - 20 - (d.revenue / maxRevenue) * (chartHeight - 45);
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const svgPath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  // Donut chart calculations
  // Active: 75%, Pending: 15%, Cancelled: 10%
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const activeStroke = circumference * 0.75;
  const pendingStroke = circumference * 0.15;
  const cancelledStroke = circumference * 0.10;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Card with 3D Isometric Illustration */}
      <div className="p-7 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        {/* Subtle decorative background waves & glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            {/* Enterprise Portal Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Enterprise Portal</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {displayName}!
            </h2>

            <p className="text-emerald-100/90 text-sm mt-2 leading-relaxed">
              Stay on top of your subscriptions, billing and more.
            </p>
          </div>

          {/* 3D Isometric Translucent Cube Illustration */}
          <div className="relative shrink-0 flex items-center justify-center pr-2">
            <svg
              viewBox="0 0 160 160"
              className="w-32 h-32 md:w-36 md:h-36 drop-shadow-2xl animate-float"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="leftFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="rightFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id="glowInner" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Background ambient circular rings */}
              <circle cx="80" cy="80" r="64" stroke="#10b981" strokeOpacity="0.12" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="80" cy="80" r="48" stroke="#34d399" strokeOpacity="0.15" strokeWidth="1" />

              {/* Translucent Cube Top Face */}
              <polygon points="80,30 125,52 80,74 35,52" fill="url(#topFace)" stroke="#6ee7b7" strokeWidth="1.5" />

              {/* Translucent Cube Left Face */}
              <polygon points="35,52 80,74 80,126 35,104" fill="url(#leftFace)" stroke="#34d399" strokeWidth="1.5" />

              {/* Translucent Cube Right Face */}
              <polygon points="80,74 125,52 125,104 80,126" fill="url(#rightFace)" stroke="#6ee7b7" strokeWidth="1.5" />

              {/* Inner Glowing Crystal Core */}
              <polygon points="80,48 105,62 80,76 55,62" fill="url(#glowInner)" stroke="#a7f3d0" strokeWidth="1" />
              <polygon points="55,62 80,76 80,108 55,94" fill="#10b981" fillOpacity="0.4" stroke="#a7f3d0" strokeWidth="1" />
              <polygon points="80,76 105,62 105,94 80,108" fill="#34d399" fillOpacity="0.5" stroke="#a7f3d0" strokeWidth="1" />

              {/* Glowing Corner Vertices */}
              <circle cx="80" cy="30" r="3" fill="#a7f3d0" />
              <circle cx="125" cy="52" r="3" fill="#a7f3d0" />
              <circle cx="35" cy="52" r="3" fill="#a7f3d0" />
              <circle cx="80" cy="74" r="3.5" fill="#ffffff" />
              <circle cx="125" cy="104" r="3" fill="#a7f3d0" />
              <circle cx="35" cy="104" r="3" fill="#a7f3d0" />
              <circle cx="80" cy="126" r="3" fill="#a7f3d0" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active Subscriptions */}
        <div className="hover-lift group p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4 cursor-pointer">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0">
            <Box className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">2</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Subscriptions</div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
              <span>↗ +0%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Next Billing Date */}
        <div className="hover-lift group p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4 cursor-pointer">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white leading-none">Nov 01, 2026</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Next Billing Date</div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              <span>In 36 days</span>
            </div>
          </div>
        </div>

        {/* Card 3: Default Payment Method */}
        <div className="hover-lift group p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4 cursor-pointer">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-700 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white leading-none">Visa •••• 4242</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Default Payment Method</div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 pt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Auto-Renew Configured</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Subscription Analytics & Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subscription Analytics (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          {/* Chart Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Subscription Analytics</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rolling monthly subscription volume and run-rate revenue
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Subscriptions</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Revenue</span>
                </div>
              </div>

              {/* Time Range Filter */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Last 12 Months">Last 12 Months</option>
                  <option value="Year to Date">Year to Date</option>
                  <option value="Last 6 Months">Last 6 Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="relative pt-2">
            {/* Interactive Tooltip Card positioned at hovered month */}
            <div
              className="absolute z-20 transition-all duration-150 pointer-events-none"
              style={{
                left: `${(activeHoverIndex / (MONTHLY_ANALYTICS.length - 1)) * 82 + 6}%`,
                top: '0px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-xl border border-slate-800 text-xs flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                  {hoveredData.subscriptions}
                </div>
                <div>
                  <div className="font-bold leading-none">
                    {hoveredData.subscriptions} Subscriptions
                  </div>
                  <div className="text-[10px] text-emerald-300 font-mono mt-0.5">
                    ${hoveredData.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Visual Combo Chart */}
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="barGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              {[0, 1, 2, 3, 4].map((tick) => {
                const y = chartHeight - 20 - (tick / maxSubs) * (chartHeight - 45);
                return (
                  <g key={tick}>
                    <line
                      x1="25"
                      y1={y}
                      x2={chartWidth - 10}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x="10"
                      y={y + 3.5}
                      className="text-[10px] fill-slate-400 font-mono font-medium"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Monthly Bars (Subscriptions) */}
              {points.map((pt, idx) => {
                const barHeight = (pt.subscriptions / maxSubs) * (chartHeight - 45);
                const barY = chartHeight - 20 - barHeight;
                const barWidth = 14;
                const isHovered = activeHoverIndex === idx;

                return (
                  <g
                    key={pt.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHoverIndex(idx)}
                  >
                    <rect
                      x={pt.x - barWidth / 2}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradient)'}
                      className="transition-all duration-200"
                    />
                    {/* Transparent hover hit target */}
                    <rect
                      x={pt.x - 18}
                      y={0}
                      width={36}
                      height={chartHeight}
                      fill="transparent"
                    />
                  </g>
                );
              })}

              {/* Revenue Smooth Bezier Curved Line */}
              <path
                d={svgPath}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Glowing Data Circles on Line */}
              {points.map((pt, idx) => {
                const isHovered = activeHoverIndex === idx;
                return (
                  <g key={`dot-${pt.month}`}>
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        fill="#6366f1"
                        fillOpacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '5' : '3.5'}
                      fill="#ffffff"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      className="transition-all cursor-pointer"
                      onMouseEnter={() => setActiveHoverIndex(idx)}
                    />
                  </g>
                );
              })}

              {/* X-Axis Month Labels */}
              {points.map((pt, idx) => (
                <text
                  key={`lbl-${pt.month}`}
                  x={pt.x}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold transition-colors cursor-pointer ${
                    activeHoverIndex === idx ? 'fill-emerald-700 font-bold' : 'fill-slate-400'
                  }`}
                  onClick={() => setActiveHoverIndex(idx)}
                >
                  {pt.month}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Right: Subscription Status Donut Chart (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Subscription Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Service license distribution breakdown
            </p>
          </div>

          {/* Donut Chart Visual & Legend */}
          <div className="my-4 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
                {/* Background Ring */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="14"
                  fill="transparent"
                />

                {/* Cancelled Segment (10%) */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#cbd5e1"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${cancelledStroke} ${circumference}`}
                  strokeDashoffset={-(activeStroke + pendingStroke)}
                  strokeLinecap="round"
                />

                {/* Pending Segment (15%) */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#6366f1"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${pendingStroke} ${circumference}`}
                  strokeDashoffset={-activeStroke}
                  strokeLinecap="round"
                />

                {/* Active Segment (75%) */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#10b981"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${activeStroke} ${circumference}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Metrics */}
              <div className="absolute text-center">
                <div className="text-2xl font-black text-slate-900 leading-none">75%</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Active
                </div>
              </div>
            </div>

            {/* Status Legend */}
            <div className="space-y-3 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Active</span>
                </div>
                <span className="font-mono font-bold text-slate-900">75%</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="font-semibold text-slate-800">Pending</span>
                </div>
                <span className="font-mono font-bold text-slate-900">15%</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="font-semibold text-slate-800">Cancelled</span>
                </div>
                <span className="font-mono font-bold text-slate-900">10%</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Account in excellent standing with zero service interruptions.</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fast-track common subscription and accounting workflows
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Action 1: View Invoices */}
            <Link
              to="/customer/invoices"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  View Invoices
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* Action 2: Update Payment */}
            <Link
              to="/customer/payment-methods"
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Update Payment
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* Action 3: Manage Plans */}
            <Link
              to="/customer/subscriptions"
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Manage Plans
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Right: Recent Activity (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <Link
                to="/customer/invoices"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              {/* Event 1 (as in reference image) */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Subscription renewed</div>
                  <div className="text-[11px] text-slate-500">{orgName}</div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">2h ago</span>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Tax receipt issued</div>
                  <div className="text-[11px] text-slate-500">INV-2026-0891 ($18,094.55)</div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">3d ago</span>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Auto-renewal verified</div>
                  <div className="text-[11px] text-slate-500">Visa ending in 4242</div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Oct 15</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Audit Trail Live</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
