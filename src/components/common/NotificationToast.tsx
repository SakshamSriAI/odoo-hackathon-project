import React from 'react';
import { useNotification, NotificationItem } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const { notifications, dismiss } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <NotificationToastItem key={n.id} item={n} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>
  );
};

const NotificationToastItem: React.FC<{
  item: NotificationItem;
  onDismiss: () => void;
}> = ({ item, onDismiss }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
  };

  const accentBars = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500',
  };

  return (
    <div
      className="pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md shadow-xl dark:shadow-2xl dark:shadow-black/80 transition-all duration-300 animate-in slide-in-from-top-3 fade-in overflow-hidden hover:scale-[1.01]"
    >
      {/* Left Colored Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBars[item.type]}`} />

      <div className="pt-0.5">{icons[item.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.title}</h4>
        {item.message && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {item.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="btn-tactile text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
