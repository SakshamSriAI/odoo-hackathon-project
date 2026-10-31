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
    if (score <= index) return 'bg-slate-200';
    if (score === 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getBadgeColor = () => {
    if (isValid) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 2) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="mt-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 transition-all duration-200">
      {/* Header and Strength Score */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          {isValid ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-slate-400" />
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
                ? 'bg-emerald-50/80 text-emerald-800'
                : passwordValue.length > 0
                ? 'bg-rose-50/50 text-slate-600'
                : 'text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  rule.passed
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {rule.passed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5 stroke-[2.5]" />}
              </span>
              <span className={rule.passed ? 'font-medium text-emerald-900' : 'text-slate-600'}>
                {rule.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
              {rule.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Validation status callout */}
      {isValid && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-100/60 p-2 rounded-lg border border-emerald-200/80 animate-in fade-in duration-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Strict Brightloop security criteria fully satisfied!</span>
        </div>
      )}
    </div>
  );
};
