import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface PhasePlaceholderProps {
  phaseNumber: number;
  phaseTitle: string;
  description: string;
  keyFeatures: string[];
}

export const PhasePlaceholder: React.FC<PhasePlaceholderProps> = ({
  phaseNumber,
  phaseTitle,
  description,
  keyFeatures,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Scheduled for Phase {phaseNumber}</span>
        </div>
        <span className="text-xs font-mono text-slate-400">Brightloop Architecture Plan</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">{phaseTitle}</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{description}</p>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Planned Deliverables in this Module:
        </div>
        <ul className="space-y-2 text-xs text-slate-600">
          {keyFeatures.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <strong className="font-semibold">Phase Isolation Protocol:</strong> Antigravity will implement this module during Phase {phaseNumber} immediately upon user approval of Phase 1.
        </div>
      </div>
    </div>
  );
};
