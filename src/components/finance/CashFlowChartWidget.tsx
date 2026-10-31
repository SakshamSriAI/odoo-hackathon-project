import React, { useState } from 'react';
import {
  Info,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileSpreadsheet,
  Calendar,
  Layers,
} from 'lucide-react';

interface MonthlyCashPoint {
  month: string;
  shortMonth: string;
  value: number; // 0 to 100 on y-axis
  cashBalance: string;
  incoming: string;
  outgoing: string;
}

const CASH_FLOW_DATA: MonthlyCashPoint[] = [
  { month: 'January', shortMonth: 'Jan', value: 43, cashBalance: '$612.4k', incoming: '$94.2k', outgoing: '$710.8k' },
  { month: 'February', shortMonth: 'Feb', value: 47.5, cashBalance: '$628.1k', incoming: '$98.5k', outgoing: '$725.3k' },
  { month: 'March', shortMonth: 'Mar', value: 49.2, cashBalance: '$641.0k', incoming: '$102.1k', outgoing: '$740.2k' },
  { month: 'April', shortMonth: 'Apr', value: 46.8, cashBalance: '$691.9k', incoming: '$106.6k', outgoing: '$798.5k' },
  { month: 'May', shortMonth: 'May', value: 49.0, cashBalance: '$675.2k', incoming: '$101.4k', outgoing: '$760.1k' },
  { month: 'June', shortMonth: 'Jun', value: 54.5, cashBalance: '$710.8k', incoming: '$112.9k', outgoing: '$780.4k' },
  { month: 'July', shortMonth: 'Jul', value: 50.1, cashBalance: '$688.3k', incoming: '$104.7k', outgoing: '$772.0k' },
  { month: 'August', shortMonth: 'Aug', value: 54.0, cashBalance: '$704.6k', incoming: '$109.8k', outgoing: '$765.2k' },
  { month: 'September', shortMonth: 'Sep', value: 58.2, cashBalance: '$729.0k', incoming: '$115.3k', outgoing: '$782.9k' },
  { month: 'October', shortMonth: 'Oct', value: 57.0, cashBalance: '$722.4k', incoming: '$111.0k', outgoing: '$790.2k' },
  { month: 'November', shortMonth: 'Nov', value: 61.2, cashBalance: '$748.9k', incoming: '$120.4k', outgoing: '$805.1k' },
  { month: 'December', shortMonth: 'Dec', value: 62.5, cashBalance: '$762.0k', incoming: '$124.8k', outgoing: '$815.0k' },
];

export const CashFlowChartWidget: React.FC = () => {
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(3); // Default to April (from screenshot)
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // SVG Chart Geometry
  const svgWidth = 720;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxY = 80;
  const minY = 0;

  // Convert points to SVG coordinates
  const points = CASH_FLOW_DATA.map((d, index) => {
    const x = paddingLeft + (index / (CASH_FLOW_DATA.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minY) / (maxY - minY)) * chartHeight;
    return { x, y, data: d, index };
  });

  // Generate smooth cubic bezier curve path string
  const createSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Horizontal Grid Lines at values: 0, 20, 40, 60, 80
  const yTicks = [80, 60, 40, 20, 0];

  // Active hover point
  const activePoint = activeHoverIndex !== null ? points[activeHoverIndex] : points[3]; // Default to April

  return (
    <div className="hover-lift bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 transition-all relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 relative">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Cash Flow
          </h3>
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
              aria-label="Cash flow information"
            >
              <Info className="w-4 h-4" />
            </button>

            {showInfoTooltip && (
              <div className="absolute left-6 top-0 z-30 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl pointer-events-none animate-in fade-in duration-150">
                <p className="font-semibold text-slate-200">Cash Flow Telemetry</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Real-time rolling ledger of cash reserves, incoming recurring subscription receipts, and operating disbursements.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Menu (...) */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn-tactile p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-30 text-xs animate-modal-pop">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.print();
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export Cash Flow PDF</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert('Exported 12-Month Cash Flow statement CSV.');
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                <span>Download CSV Ledger</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setActiveHoverIndex(3);
                }}
                className="w-full text-left px-3 py-2 text-indigo-600 hover:bg-indigo-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Reset to Baseline (04/01/2019)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout: Chart on Left, 3 Stacked KPI Metrics on Right */}
      <div className="mt-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        {/* Left Side: Smooth SVG Curve Chart */}
        <div className="flex-1 w-full min-w-0">
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              style={{ maxHeight: '310px' }}
            >
              <defs>
                {/* Soft Purple Area Gradient matching image */}
                <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                  <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.0" />
                </linearGradient>

                {/* Subtle drop shadow for line */}
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7C3AED" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Horizontal Grid Lines and Y-Axis Tick Labels */}
              {yTicks.map((val) => {
                const y = paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
                return (
                  <g key={val}>
                    {/* Y-Axis Label */}
                    <text
                      x={paddingLeft - 14}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[11px] fill-slate-400 font-sans font-medium"
                    >
                      {val}
                    </text>

                    {/* Dashed Horizontal Gridline */}
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                  </g>
                );
              })}

              {/* Fill Area */}
              <path d={areaPath} fill="url(#cashFlowGradient)" />

              {/* Smooth Purple Curve Stroke */}
              <path
                d={linePath}
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lineGlow)"
              />

              {/* X-Axis Month Labels */}
              {points.map((pt) => {
                const isSelected = activeHoverIndex === pt.index;
                return (
                  <g key={pt.data.shortMonth}>
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 24}
                      textAnchor="middle"
                      className={`text-[12px] font-sans transition-colors cursor-pointer ${
                        isSelected
                          ? 'fill-indigo-700 font-bold'
                          : 'fill-slate-500 hover:fill-slate-800'
                      }`}
                      onClick={() => setActiveHoverIndex(pt.index)}
                    >
                      {pt.data.shortMonth}
                    </text>

                    {/* Invisible Wide Hover Bars for Smooth Touch / Mouse Interaction */}
                    <rect
                      x={pt.x - chartWidth / (CASH_FLOW_DATA.length * 2)}
                      y={paddingTop}
                      width={chartWidth / CASH_FLOW_DATA.length}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveHoverIndex(pt.index)}
                    />
                  </g>
                );
              })}

              {/* Active Hover Guide Line and Marker */}
              {activePoint && (
                <g>
                  {/* Vertical Guide Line */}
                  <line
                    x1={activePoint.x}
                    y1={paddingTop}
                    x2={activePoint.x}
                    y2={paddingTop + chartHeight}
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-70 animate-in fade-in"
                  />

                  {/* Outer Glow Halo Ring */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="8"
                    fill="#7C3AED"
                    fillOpacity="0.2"
                    className="animate-ping"
                  />

                  {/* Outer Ring */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="6"
                    fill="#FFFFFF"
                    stroke="#7C3AED"
                    strokeWidth="2.5"
                  />

                  {/* Inner Solid Center */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="2.5"
                    fill="#7C3AED"
                  />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right Side: 3 Stacked Metric Summary Blocks (Identical to Image) */}
        <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 flex flex-row lg:flex-col justify-between lg:justify-center gap-6 lg:gap-8">
          {/* Block 1: Cash as on 04/01/2019 */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-600 tracking-normal">
              {activeHoverIndex !== null && activeHoverIndex !== 3
                ? `Cash in ${CASH_FLOW_DATA[activeHoverIndex].month}`
                : 'Cash as on 04/01/2019'}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
              {activePoint ? activePoint.data.cashBalance : '$691.9k'}
            </div>
          </div>

          {/* Block 2: Incoming */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-500 tracking-normal">
              Incoming
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
              {activePoint ? activePoint.data.incoming : '$106.6k'}
            </div>
          </div>

          {/* Block 3: Outgoing */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-rose-500 tracking-normal">
              Outgoing
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
              {activePoint ? activePoint.data.outgoing : '$798.5k'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
