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
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-emerald-900/5',
    error: 'border-rose-200 bg-white shadow-rose-900/5',
    warning: 'border-amber-200 bg-white shadow-amber-900/5',
    info: 'border-indigo-200 bg-white shadow-indigo-900/5',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-top-2 duration-200 ${borders[item.type]}`}
    >
      <div className="pt-0.5">{icons[item.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 leading-tight">{item.title}</h4>
        {item.message && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
