import React, { useState } from 'react';
import { Subscription, SubscriptionStatus } from '../../types/sales';
import { useSales } from '../../context/SalesContext';
import { useNotification } from '../../context/NotificationContext';
import {
  FileEdit,
  Send,
  CheckCircle2,
  Zap,
  Archive,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface SubscriptionPipelineStepperProps {
  subscription: Subscription;
}

export const SubscriptionPipelineStepper: React.FC<SubscriptionPipelineStepperProps> = ({
  subscription,
}) => {
  const { advanceSubscriptionStatus } = useSales();
  const { notify } = useNotification();
  const [transitionNote, setTransitionNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const stages: Array<{
    key: SubscriptionStatus;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'draft',
      label: 'Draft',
      description: 'Quotation template drafted',
      icon: <FileEdit className="w-4 h-4" />,
    },
    {
      key: 'quotation',
      label: 'Quotation',
      description: 'Proposal delivered to client',
      icon: <Send className="w-4 h-4" />,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      description: 'Customer accepted terms',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      key: 'active',
      label: 'Active',
      description: 'Provisioned & recurring',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      key: 'closed',
      label: 'Closed',
      description: 'Completed or concluded',
      icon: <Archive className="w-4 h-4" />,
    },
  ];

  const stageKeys = stages.map((s) => s.key);
  const currentStageIndex = stageKeys.indexOf(subscription.status);

  const handleAdvance = (targetStatus: SubscriptionStatus) => {
    advanceSubscriptionStatus(
      subscription.id,
      targetStatus,
      transitionNote.trim() || undefined
    );
    notify(
      'success',
      'Status Pipeline Updated',
      `${subscription.id} successfully progressed to "${targetStatus.toUpperCase()}".`
    );
    setTransitionNote('');
    setShowNoteInput(false);
  };

  const getNextStage = (): SubscriptionStatus | null => {
    if (currentStageIndex < stageKeys.length - 1) {
      return stageKeys[currentStageIndex + 1];
    }
    return null;
  };

  const nextStage = getNextStage();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Visual Status Pipeline Stepper
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-800">
              {subscription.id}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Subscription Lifecycle Progression
          </h3>
        </div>

        {/* Next Stage Fast-Action Button */}
        {nextStage && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleAdvance(nextStage)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>
                {nextStage === 'quotation' && 'Dispatch Quotation to Customer'}
                {nextStage === 'confirmed' && 'Confirm Customer Acceptance'}
                {nextStage === 'active' && 'Provision & Activate Subscription'}
                {nextStage === 'closed' && 'Conclude / Close Subscription'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Stepper Visual Track */}
      <div className="relative">
        {/* Horizontal Connector Line (hidden on small screens) */}
        <div className="hidden sm:block absolute top-1/2 -translate-y-5 left-10 right-10 h-1 bg-slate-200 -z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;

            // Find matching log in history
            const historyLog = [...subscription.statusHistory]
              .reverse()
              .find((log) => log.status === stage.key);

            return (
              <div
                key={stage.key}
                onClick={() => !isCurrent && handleAdvance(stage.key)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-700 hover:bg-emerald-50/70'
                    : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100/60'
                }`}
                title={`Click to set stage to ${stage.label}`}
              >
                {/* Stepper Node Header */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-transform ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/40 scale-105'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span>0{idx + 1}</span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isCurrent
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCurrent ? 'Current' : isCompleted ? 'Passed' : 'Pending'}
                  </span>
                </div>

                {/* Stage Label */}
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-indigo-950' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {stage.description}
                  </p>
                </div>

                {/* Timestamp info if available */}
                {historyLog && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(historyLog.timestamp).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Transition & Optional Note Expander */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-600">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Current Status: <strong className="uppercase text-slate-900">{subscription.status}</strong>
            {subscription.statusHistory.length > 0 && (
              <span className="text-slate-400 ml-2">
                • Last updated by{' '}
                {subscription.statusHistory[subscription.statusHistory.length - 1].actor}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {stageKeys.map((st) => (
            <button
              key={st}
              onClick={() => handleAdvance(st)}
              disabled={subscription.status === st}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                subscription.status === st
                  ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
              }`}
            >
              Set {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
