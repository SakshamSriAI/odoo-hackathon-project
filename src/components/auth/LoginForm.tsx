import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserRole } from '../../types/auth';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Briefcase, Users } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@brightloop.io');
  const [password, setPassword] = useState('Brightloop#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      notify('error', 'Email Required', 'Please enter your registered email address.');
      return;
    }
    if (!password) {
      notify('error', 'Password Required', 'Please enter your Brightloop password.');
      return;
    }

    try {
      await login(email, selectedRole);
      notify('success', 'Welcome back!', `Signed in successfully as ${selectedRole.toUpperCase()} account.`);
      navigate(`/${selectedRole}`, { replace: true });
    } catch (err) {
      notify('error', 'Authentication Failed', 'Please verify your credentials and try again.');
    }
  };

  const handleSelectDemoUser = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@brightloop.io');
      setPassword('Brightloop#Admin2026!');
    } else if (role === 'staff') {
      setEmail('staff@brightloop.io');
      setPassword('Brightloop#Staff2026!');
    } else {
      setEmail('customer@brightloop.io');
      setPassword('Brightloop#Cust2026!');
    }
    notify('info', `Demo Persona: ${role.toUpperCase()}`, 'Pre-filled demo credentials for testing.');
  };

  return (
    <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/70 border border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in to Brightloop</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access your subscription management portals and billing workspace
        </p>
      </div>

      {/* Demo Credentials Quick-Select Pill Tabs */}
      <div className="mb-6 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Quick Demo Personas (1-Click Fill)</span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Instant Test</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectDemoUser('admin')}
            className={`btn-tactile flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDemoUser('staff')}
            className={`btn-tactile flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              selectedRole === 'staff'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDemoUser('customer')}
            className={`btn-tactile flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              selectedRole === 'customer'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Customer</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="login-email">
            Business Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="login-password">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Target Portal Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Designated Portal Access
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label
              className={`flex items-center justify-center p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                selectedRole === 'admin'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="admin"
                checked={selectedRole === 'admin'}
                onChange={() => setSelectedRole('admin')}
                className="sr-only"
              />
              <span>Admin</span>
            </label>

            <label
              className={`flex items-center justify-center p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                selectedRole === 'staff'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="staff"
                checked={selectedRole === 'staff'}
                onChange={() => setSelectedRole('staff')}
                className="sr-only"
              />
              <span>Staff</span>
            </label>

            <label
              className={`flex items-center justify-center p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                selectedRole === 'customer'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="customer"
                checked={selectedRole === 'customer'}
                onChange={() => setSelectedRole('customer')}
                className="sr-only"
              />
              <span>Customer</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-tactile w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to {selectedRole.toUpperCase()} Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          New organization or subscriber?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
