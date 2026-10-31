import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, UserCheck, RefreshCw } from 'lucide-react';
import { UserRole } from '../types/auth';

export const UnauthorizedPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    currentRole?: UserRole;
    requiredRoles?: UserRole[];
    attemptedPath?: string;
  } | undefined;

  const currentRole = state?.currentRole || user?.role || 'customer';
  const requiredRoles = state?.requiredRoles || ['admin'];
  const attemptedPath = state?.attemptedPath || 'the requested page';

  const targetRole = requiredRoles[0] || 'admin';

  const handleSimulateSwitch = () => {
    switchRole(targetRole);
    navigate(`/${targetRole}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Access Restricted (403)
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">Portal Access Denied</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            You do not have the required access permissions to view{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
              {attemptedPath}
            </code>
            .
          </p>
        </div>

        {/* Role Diagnostic Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Your Active Role:</span>
            <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-slate-200 text-slate-800">
              {currentRole}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Required Access Level:</span>
            <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-purple-100 text-purple-800">
              {requiredRoles.join(' or ')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* 1-Click Persona Simulator for Testers */}
          <button
            onClick={handleSimulateSwitch}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to {targetRole.toUpperCase()} Persona & View Portal</span>
          </button>

          {/* Return to authorized portal */}
          <button
            onClick={() => navigate(`/${currentRole}`)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {currentRole.toUpperCase()} Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
