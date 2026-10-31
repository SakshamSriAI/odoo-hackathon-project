import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail } from '../../utils/validation';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Copy, KeyRound } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const { notify } = useNotification();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !validateEmail(email)) {
      notify('error', 'Invalid Email', 'Please enter a valid registered Brightloop email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(email);
      setGeneratedToken(res.previewToken || null);
      setSubmitted(true);
      notify('success', 'Reset Link Dispatched', `We sent a secure password reset link to ${email}`);
    } catch (err) {
      notify('error', 'Request Failed', 'Failed to generate reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedToken) return;
    const link = `${window.location.origin}/reset-password?token=${generatedToken}&email=${encodeURIComponent(
      email
    )}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    notify('info', 'Link Copied', 'Password reset URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/70 border border-slate-200/80 dark:border-slate-800 transition-colors">
      {!submitted ? (
        <>
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Forgot password?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your registered Brightloop email and we'll send a secure one-time link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="reset-email">
                Registered Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brightloop.io or your work email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check your email inbox</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              We have generated a secure password reset token and sent instructions to{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">{email}</strong>.
            </p>
          </div>

          {/* Token Link Preview */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span>Simulated Reset Token Link</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded font-mono">
                Valid for 15 mins
              </span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 break-all select-all">
              {window.location.origin}/reset-password?token={generatedToken}
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Didn't receive the email? Check spam or{' '}
            <button
              onClick={() => {
                setSubmitted(false);
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              try another email
            </button>
          </div>
        </div>
      )}

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to sign in</span>
        </Link>
      </div>
    </div>
  );
};
