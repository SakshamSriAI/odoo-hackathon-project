import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, sanitizeName } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types/auth';
import { NotificationToastContainer } from '../components/common/NotificationToast';
import {
  RefreshCw,
  LayoutDashboard,
  Package,
  CalendarDays,
  Percent,
  Receipt,
  FileSpreadsheet,
  Layers,
  CreditCard,
  UserCheck,
  Shield,
  Briefcase,
  Users,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
  X,
  CheckCircle2,
  TrendingUp,
  Headphones,
  ArrowRight,
  Sun,
  Moon,
  Database,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  portalRole: UserRole;
  title: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  portalRole,
  title,
  subtitle,
}) => {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleStyles = {
    admin: {
      badgeBg:
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
      label: 'Admin Portal',
      icon: <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      accentColor: 'indigo',
    },
    staff: {
      badgeBg:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
      label: 'Internal Staff Portal',
      icon: <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      accentColor: 'blue',
    },
    customer: {
      badgeBg:
        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
      label: 'Customer Portal',
      icon: <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      accentColor: 'emerald',
    },
  };

  const navItemsByRole: Record<
    UserRole,
    Array<{ label: string; path: string; icon: React.ReactNode }>
  > = {
    admin: [
      { label: 'Admin Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Products Catalog', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
      { label: 'Subscription Plans', path: '/admin/plans', icon: <CalendarDays className="w-4 h-4" /> },
      { label: 'Discount Rules', path: '/admin/discounts', icon: <Percent className="w-4 h-4" /> },
      { label: 'Invoices & Billing', path: '/admin/invoices', icon: <Receipt className="w-4 h-4" /> },
      { label: 'Finance Dashboard', path: '/admin/finance', icon: <TrendingUp className="w-4 h-4" /> },
    ],
    staff: [
      { label: 'Sales Overview', path: '/staff', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Quotation Builder', path: '/staff/quotations', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { label: 'Subscriptions Pipeline', path: '/staff/subscriptions', icon: <Layers className="w-4 h-4" /> },
      { label: 'Payment Entries', path: '/staff/payments', icon: <CreditCard className="w-4 h-4" /> },
      { label: 'Finance Dashboard', path: '/finance', icon: <TrendingUp className="w-4 h-4" /> },
    ],
    customer: [
      { label: 'My Subscriptions', path: '/customer', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Active Plans', path: '/customer/subscriptions', icon: <Layers className="w-4 h-4" /> },
      { label: 'Invoices & Receipts', path: '/customer/invoices', icon: <Receipt className="w-4 h-4" /> },
      { label: 'Payment Profile', path: '/customer/payment-methods', icon: <CreditCard className="w-4 h-4" /> },
    ],
  };

  const currentNav = navItemsByRole[portalRole] || [];

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
    navigate(`/${newRole}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <NotificationToastContainer />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0D1322]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Left: Brand & Portal Badge */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to={`/${portalRole}`} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Brightloop</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hidden sm:inline">Software</span>
              </div>
            </Link>

            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">/</span>

            {/* Portal Indicator Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleStyles[portalRole].badgeBg}`}
            >
              {roleStyles[portalRole].icon}
              <span>{roleStyles[portalRole].label}</span>
            </div>
          </div>

          {/* Right: Quick Role Switcher + Theme Toggle + User Profile */}
          <div className="flex items-center gap-3">
            {/* Live Backend & SQLite Database Status Badge */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 shadow-2xs"
              title="Connected to SQLite (node:sqlite) on http://localhost:5001/api"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SQLite Connected</span>
            </div>

            {/* Persona Switcher Quick Widget */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                title="Switch portal persona to test different role permissions"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Switch Portal: <strong className="capitalize">{user?.role}</strong></span>
                <ChevronDown className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl dark:shadow-black/70 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60">
                    Switch Test Persona
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      user?.role === 'admin'
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/50 font-semibold text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <div>Admin Portal</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">admin@brightloop.io</div>
                      </div>
                    </div>
                    {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      user?.role === 'staff'
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/50 font-semibold text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div>Internal Staff Portal</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">staff@brightloop.io</div>
                      </div>
                    </div>
                    {user?.role === 'staff' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('customer')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      user?.role === 'customer'
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/50 font-semibold text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div>Customer Portal</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">customer@brightloop.io</div>
                      </div>
                    </div>
                    {user?.role === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Day / Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-tactile p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-amber-300 transition-all cursor-pointer shadow-2xs flex items-center justify-center hover:shadow-sm"
              title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark Focused)'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <img
                  src={
                    user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      sanitizeName(user?.name) || 'User'
                    )}`
                  }
                  alt={sanitizeName(user?.name) || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {sanitizeName(user?.name) || 'Guest User'}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                    {user?.organization || user?.email}
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Log out of Brightloop"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {roleStyles[portalRole].label} Navigation
            </div>
            <nav className="space-y-1">
              {currentNav.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main App Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0D1322] border-r border-slate-200 dark:border-slate-800/80 shrink-0 justify-between transition-colors">
          <div className="p-4 space-y-6">
            {/* Navigation Section */}
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {roleStyles[portalRole].label} Navigation
              </div>
              <nav className="space-y-1">
                {currentNav.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Portal Switch Links */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Direct Portals
              </div>
              <div className="space-y-1">
                <Link
                  to="/admin"
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    portalRole === 'admin'
                      ? 'text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/40'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Admin Portal
                  </span>
                  {portalRole === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-medium">
                      Active
                    </span>
                  )}
                </Link>

                <Link
                  to="/staff"
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    portalRole === 'staff'
                      ? 'text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/40'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Staff Portal
                  </span>
                  {portalRole === 'staff' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium">
                      Active
                    </span>
                  )}
                </Link>

                <Link
                  to="/customer"
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    portalRole === 'customer'
                      ? 'text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Customer Portal
                  </span>
                  {portalRole === 'customer' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium">
                      Active
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Customer Portal Sidebar Support Card */}
          {portalRole === 'customer' ? (
            <div className="p-4 m-3 bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 transition-colors">
              <div className="flex items-center gap-2 mb-1 text-slate-800 dark:text-slate-200 font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span>Need Assistance?</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                Dedicated support team available 24/7.
              </p>
              <a
                href="mailto:support@brightloop.io"
                className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Contact Support</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ) : (
            /* System Status Card (Replaced the cluttered Phase status widget) */
            <div className="p-3.5 m-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">System Status</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot-pulse" />
                  Live & Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Enterprise Cloud • Real-Time Engine
              </p>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
            {/* Header section with titles */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
              </div>

              {/* Breadcrumb info */}
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span>Brightloop</span>
                <span>/</span>
                <span className="capitalize">{portalRole}</span>
                <span>/</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{title}</span>
              </div>
            </div>

            {/* Child page body */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
