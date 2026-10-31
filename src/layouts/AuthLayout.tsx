import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Layers, RefreshCw, Sparkles } from 'lucide-react';
import { NotificationToastContainer } from '../components/common/NotificationToast';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <NotificationToastContainer />

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Hero Brand Panel (visible on lg screens) */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-indigo-950">
          {/* Ambient Glow Effects */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                  Brightloop
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-medium">
                    Software
                  </span>
                </span>
                <span className="text-xs text-slate-400 tracking-wider uppercase font-semibold">
                  Subscription Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Hero Feature Highlights */}
          <div className="relative z-10 space-y-8 my-auto py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Complete Lifecycle Subscription Operations</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Smarter billing, automated pricing & tiered subscription workflows.
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Brightloop provides unified portals for Administrators, Sales Staff, and Customers to configure products, orchestrate quotation pipelines, and collect recurring payments effortlessly.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Dynamic Product Catalog & Markup</h4>
                  <p className="text-xs text-slate-400">Configure recurring frequencies, brand markups, and flexible billing cycles.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">End-to-End Sales Pipeline</h4>
                  <p className="text-xs text-slate-400">Generate quotes, track status progression from Draft to Active, and generate automated invoices.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Role-Based Access Governance</h4>
                  <p className="text-xs text-slate-400">Strict separation of duty across Admin, Internal Staff, and Customer workspaces.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Certs */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>SOC2 Type II Certified</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              256-bit AES Enterprise Grade
            </span>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900">Brightloop Software</span>
                <p className="text-xs text-slate-500">Subscription Management System</p>
              </div>
            </div>

            {children}
          </div>
        </div>
      </main>

      {/* Global Bottom Bar */}
      <footer className="py-4 px-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 Brightloop Software Inc. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-600 cursor-pointer">Security Portal</span>
        </div>
      </footer>
    </div>
  );
};
