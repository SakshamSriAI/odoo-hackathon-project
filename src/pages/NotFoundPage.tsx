import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();
  const defaultPortal = user ? `/${user.role}` : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
          <RefreshCw className="w-8 h-8 animate-spin-slow" />
        </div>

        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            Error 404
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">Page Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The requested page does not exist or has been moved within Brightloop Software.
          </p>
        </div>

        <Link
          to={defaultPortal}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to {user ? `${user.role.toUpperCase()} Workspace` : 'Login'}</span>
        </Link>
      </div>
    </div>
  );
};
