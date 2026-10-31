import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, sanitizeName } from '../context/AuthContext';
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
  Clock,
  ExternalLink,
  TrendingUp,
  Headphones,
  ArrowRight,
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
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleStyles = {
    admin: {
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Admin Portal',
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      accentColor: 'indigo',
    },
    staff: {
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Internal Staff Portal',
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
      accentColor: 'blue',
    },
    customer: {
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      label: 'Customer Portal',
      icon: <Users className="w-4 h-4 text-emerald-600" />,
      accentColor: 'emerald',
    },
  };

  const navItemsByRole: Record<
    UserRole,
    Array<{ label: string; path: string; icon: React.ReactNode; phaseTag?: string }>
  > = {
    admin: [
      { label: 'Admin Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Products Catalog', path: '/admin/products', icon: <Package className="w-4 h-4" />, phaseTag: 'Phase 2' },
      { label: 'Subscription Plans', path: '/admin/plans', icon: <CalendarDays className="w-4 h-4" />, phaseTag: 'Phase 2' },
      { label: 'Discount Rules', path: '/admin/discounts', icon: <Percent className="w-4 h-4" />, phaseTag: 'Phase 4' },
      { label: 'Invoices & Billing', path: '/admin/invoices', icon: <Receipt className="w-4 h-4" />, phaseTag: 'Phase 4' },
      { label: 'Finance Dashboard', path: '/admin/finance', icon: <TrendingUp className="w-4 h-4" />, phaseTag: 'Phase 5' },
    ],
    staff: [
      { label: 'Sales Overview', path: '/staff', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Quotation Builder', path: '/staff/quotations', icon: <FileSpreadsheet className="w-4 h-4" />, phaseTag: 'Phase 3' },
      { label: 'Subscriptions Pipeline', path: '/staff/subscriptions', icon: <Layers className="w-4 h-4" />, phaseTag: 'Phase 3' },
      { label: 'Payment Entries', path: '/staff/payments', icon: <CreditCard className="w-4 h-4" />, phaseTag: 'Phase 5' },
      { label: 'Finance Dashboard', path: '/finance', icon: <TrendingUp className="w-4 h-4" />, phaseTag: 'Phase 5' },
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NotificationToastContainer />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Left: Brand & Portal Badge */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to={`/${portalRole}`} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">Brightloop</span>
                <span className="text-xs font-semibold text-indigo-600 hidden sm:inline">Software</span>
              </div>
            </Link>

            <span className="hidden sm:inline-block text-slate-300">/</span>

            {/* Portal Indicator Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleStyles[portalRole].badgeBg}`}
            >
              {roleStyles[portalRole].icon}
              <span>{roleStyles[portalRole].label}</span>
            </div>
          </div>

          {/* Right: Quick Role Switcher (Persona Testing Tool) + User Profile */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher Quick Widget */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 text-xs font-medium transition-colors shadow-2xs"
                title="Switch portal persona to test different role permissions"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Switch Portal: <strong className="capitalize">{user?.role}</strong></span>
                <ChevronDown className="w-3 h-3 text-indigo-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Test Persona
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                      user?.role === 'admin' ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <div>
                        <div>Admin Portal</div>
                        <div className="text-[10px] text-slate-400">admin@brightloop.io</div>
                      </div>
                    </div>
                    {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                      user?.role === 'staff' ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <div>
                        <div>Internal Staff Portal</div>
                        <div className="text-[10px] text-slate-400">staff@brightloop.io</div>
                      </div>
                    </div>
                    {user?.role === 'staff' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('customer')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                      user?.role === 'customer' ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>Customer Portal</div>
                        <div className="text-[10px] text-slate-400">customer@brightloop.io</div>
                      </div>
                    </div>
                    {user?.role === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <img
                  src={
                    user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      sanitizeName(user?.name) || 'User'
                    )}`
                  }
                  alt={sanitizeName(user?.name) || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {sanitizeName(user?.name) || 'Guest User'}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {user?.organization || user?.email}
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Log out of Brightloop"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 justify-between">
          <div className="p-4 space-y-6">
            {/* Navigation Section */}
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {roleStyles[portalRole].label} Navigation
              </div>
              <nav className="space-y-1">
                {currentNav.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.phaseTag && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                            isActive
                              ? 'bg-indigo-700 text-indigo-100'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.phaseTag}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Portal Switch Links */}
            <div className="pt-4 border-t border-slate-100">
              <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Direct Portals
              </div>
              <div className="space-y-1">
                <Link
                  to="/admin"
                  className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg ${
                    portalRole === 'admin'
                      ? 'text-purple-700 font-semibold bg-purple-50'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Admin Portal
                  </span>
                  {portalRole === 'admin' && <span className="text-[10px]">Active</span>}
                </Link>

                <Link
                  to="/staff"
                  className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg ${
                    portalRole === 'staff'
                      ? 'text-blue-700 font-semibold bg-blue-50'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Staff Portal
                  </span>
                  {portalRole === 'staff' && <span className="text-[10px]">Active</span>}
                </Link>

                <Link
                  to="/customer"
                  className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg ${
                    portalRole === 'customer'
                      ? 'text-emerald-700 font-semibold bg-emerald-50'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Customer Portal
                  </span>
                  {portalRole === 'customer' && <span className="text-[10px]">Active</span>}
                </Link>
              </div>
            </div>
          </div>

          {/* Customer Portal Sidebar Support Card (from design reference) */}
          {portalRole === 'customer' && (
            <div className="p-4 m-3 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200/80">
              <div className="flex items-center gap-2 mb-1 text-slate-800 font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span>Need Help?</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Our support team is here for you.
              </p>
              <a
                href="mailto:support@brightloop.io"
                className="w-full py-1.5 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Contact Support</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Development Phase Status Widget in Sidebar (Internal only - hidden for customer portal) */}
          {portalRole !== 'customer' && (
            <div className="p-4 m-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Development Pipeline</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  All 5 Phases Complete
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Phase 1: Project Setup & Auth UI</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Phase 2: Product & Plans Catalog</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Phase 3: Sales Workflow & Pipeline</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Phase 4: Invoicing & Discount Rules</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Phase 5: Payments & Finance Dashboard</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header section with titles */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
              </div>

              {/* Breadcrumb info */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Brightloop</span>
                <span>/</span>
                <span className="capitalize">{portalRole}</span>
                <span>/</span>
                <span className="text-slate-700 font-medium">{title}</span>
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
