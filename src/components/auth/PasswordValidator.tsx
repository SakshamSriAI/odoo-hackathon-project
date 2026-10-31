import React from 'react';
import { Check, X, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { PasswordValidationResult } from '../../types/auth';

interface PasswordValidatorProps {
  validation: PasswordValidationResult;
  passwordValue: string;
}

export const PasswordValidator: React.FC<PasswordValidatorProps> = ({
  validation,
  passwordValue,
}) => {
  const { criteria, score, strengthLabel, isValid } = validation;

  const rules = [
    {
      key: 'minLength',
      label: 'More than 8 characters (at least 9 chars)',
      passed: criteria.minLength,
      detail: `${passwordValue.length}/9 characters entered`,
    },
    {
      key: 'hasUppercase',
      label: 'At least one uppercase letter (A-Z)',
      passed: criteria.hasUppercase,
      detail: 'e.g. A, B, C...',
    },
    {
      key: 'hasLowercase',
      label: 'At least one lowercase letter (a-z)',
      passed: criteria.hasLowercase,
      detail: 'e.g. a, b, c...',
    },
    {
      key: 'hasSpecialChar',
      label: 'At least one special character (!@#$%^&*...)',
      passed: criteria.hasSpecialChar,
      detail: 'e.g. @, #, $, %, !...',
    },
  ];

  // Calculate meter bar styling
  const getBarColor = (index: number) => {
    if (score <= index) return 'bg-slate-200 dark:bg-slate-700';
    if (score === 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getBadgeColor = () => {
    if (isValid) return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (score >= 2) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="mt-3 p-3.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-all duration-200">
      {/* Header and Strength Score */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          {isValid ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
          <span>Password Security Requirements</span>
        </div>
        <span
          className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${getBadgeColor()}`}
        >
          {passwordValue.length === 0 ? 'Not entered' : strengthLabel}
        </span>
      </div>

      {/* Strength 4-segment meter */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`h-full rounded-full transition-colors duration-300 ${getBarColor(idx)}`}
          />
        ))}
      </div>

      {/* Rules list */}
      <div className="space-y-1.5 pt-1">
        {rules.map((rule) => (
          <div
            key={rule.key}
            className={`flex items-center justify-between text-xs py-0.5 px-2 rounded-md transition-all ${
              rule.passed
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : passwordValue.length > 0
                ? 'bg-rose-50/50 dark:bg-rose-950/30 text-slate-600 dark:text-slate-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  rule.passed
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {rule.passed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5 stroke-[2.5]" />}
              </span>
              <span className={rule.passed ? 'font-medium text-emerald-900 dark:text-emerald-200' : 'text-slate-600 dark:text-slate-400'}>
                {rule.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline-block">
              {rule.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Validation status callout */}
      {isValid && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-100/60 dark:bg-emerald-950/50 p-2 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 animate-in fade-in duration-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Strict Brightloop security criteria fully satisfied!</span>
        </div>
      )}
    </div>
  );
};
