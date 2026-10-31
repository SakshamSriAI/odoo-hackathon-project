import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validatePassword, validateEmail } from '../../utils/validation';
import { PasswordValidator } from './PasswordValidator';
import { UserRole } from '../../types/auth';
import {
  User as UserIcon,
  Mail,
  Building,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Briefcase,
  Users,
  CheckCircle,
} from 'lucide-react';

export const SignupForm: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Real-time validation computation
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isEmailValid = email.length > 0 && validateEmail(email);

  const canSubmit =
    name.trim().length > 1 &&
    isEmailValid &&
    passwordValidation.isValid &&
    passwordsMatch &&
    agreeTerms &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notify('error', 'Validation Error', 'Please enter your full name.');
      return;
    }

    if (!isEmailValid) {
      notify('error', 'Invalid Email', 'Please provide a valid business email address.');
      return;
    }

    if (!passwordValidation.isValid) {
      notify(
        'error',
        'Password Security Requirements Not Met',
        'Password must be > 8 characters, contain at least 1 uppercase, 1 lowercase, and 1 special character.'
      );
      return;
    }

    if (!passwordsMatch) {
      notify('error', 'Password Mismatch', 'The confirmation password does not match.');
      return;
    }

    if (!agreeTerms) {
      notify('warning', 'Terms Required', 'Please accept the Brightloop Software Terms of Service.');
      return;
    }

    try {
      await signup({
        name,
        email,
        organization,
        role,
        password,
      });

      notify(
        'success',
        'Account Registered Successfully!',
        `Welcome to Brightloop, ${name}! Logged into the ${role.toUpperCase()} portal.`
      );
      navigate(`/${role}`, { replace: true });
    } catch (err) {
      notify('error', 'Signup Failed', 'Unable to create account. Please try again.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-sm text-slate-500 mt-1">
          Join Brightloop Software for intelligent subscription management
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="signup-name">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Portal Account Type *
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="customer">Customer (Subscriber)</option>
                <option value="staff">Internal Staff (Sales/Ops)</option>
                <option value="admin">Administrator (Catalog & Billing)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="signup-email">
            Work Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eleanor@company.com"
              className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm focus:ring-2 focus:outline-none placeholder:text-slate-400 ${
                email && !isEmailValid
                  ? 'border-rose-300 focus:ring-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500'
              }`}
              required
            />
          </div>
          {email && !isEmailValid && (
            <p className="text-[11px] text-rose-500 mt-1">Please enter a valid email format</p>
          )}
        </div>

        {/* Company / Organization */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="signup-org">
            Company or Organization
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-org"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Vance Robotics Ltd."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="signup-password">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter strong password (> 8 chars)"
              className={`w-full pl-10 pr-10 py-2 rounded-xl border text-sm focus:ring-2 focus:outline-none placeholder:text-slate-400 ${
                password.length > 0 && !passwordValidation.isValid
                  ? 'border-amber-400 focus:ring-amber-500'
                  : passwordValidation.isValid
                  ? 'border-emerald-500 focus:ring-emerald-500'
                  : 'border-slate-300 focus:ring-indigo-500'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Interactive Password Validator Display */}
          <PasswordValidator validation={passwordValidation} passwordValue={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="signup-confirm">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`w-full pl-10 pr-10 py-2 rounded-xl border text-sm focus:ring-2 focus:outline-none placeholder:text-slate-400 ${
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'border-rose-400 focus:ring-rose-500'
                  : passwordsMatch
                  ? 'border-emerald-500 focus:ring-emerald-500'
                  : 'border-slate-300 focus:ring-indigo-500'
              }`}
              required
            />
            {passwordsMatch && (
              <CheckCircle className="w-4 h-4 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-[11px] text-rose-500 mt-1">Passwords do not match yet</p>
          )}
        </div>

        {/* Terms agreement */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I agree to the Brightloop Subscription Terms, Data Privacy Policy, and Master Services Agreement.
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already have a Brightloop account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
