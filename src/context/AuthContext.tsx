import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthState, ResetPasswordRequest } from '../types/auth';
import { authApi } from '../services/api';

interface SignupData {
  name: string;
  email: string;
  role?: UserRole;
  organization?: string;
  password?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; previewToken?: string }>;
  resetRequests: ResetPasswordRequest[];
}

const DEFAULT_USERS: Record<UserRole, User> = {
  admin: {
    id: 'usr_admin_01',
    email: 'admin@brightloop.io',
    name: 'Sarah Connor',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    organization: 'Brightloop HQ - Global Administration',
    createdAt: '2025-01-15T08:00:00Z',
  },
  staff: {
    id: 'usr_staff_01',
    email: 'staff@brightloop.io',
    name: 'Alex Vance',
    role: 'staff',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    organization: 'Brightloop Sales Operations',
    createdAt: '2025-02-10T10:30:00Z',
  },
  customer: {
    id: 'usr_cust_01',
    email: 'customer@brightloop.io',
    name: 'Emily Chen',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    organization: 'Acme Technologies Inc.',
    createdAt: '2025-03-01T14:15:00Z',
  },
};

const STORAGE_KEY = 'brightloop_auth_user';

export const sanitizeName = (rawName?: string): string => {
  if (!rawName) return '';
  return rawName.replace(/\s*\((ADMIN|STAFF|CUSTOMER)\)/gi, '').trim();
};

const DEFAULT_PERSONA_NAMES = ['sarah connor', 'alex vance', 'emily chen'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resetRequests, setResetRequests] = useState<ResetPasswordRequest[]>([]);

  useEffect(() => {
    // Check saved session in localStorage and clean any legacy role suffixes
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: User = JSON.parse(saved);
        if (parsed && parsed.name) {
          const cleaned = sanitizeName(parsed.name);
          if (cleaned !== parsed.name) {
            parsed.name = cleaned;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        }
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to parse stored auth user', e);
    } finally {
      setIsLoading(false);
    }

    // Check for any active password resets in backend
    authApi.getResetRequests()
      .then((requests) => {
        if (Array.isArray(requests) && requests.length > 0) {
          setResetRequests(requests);
        }
      })
      .catch(() => {});
  }, []);

  const login = useCallback(async (email: string, specificRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, specificRole);
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('[Auth] Backend login fallback to local credentials:', err);
    }

    // Fallback if backend offline
    let matchedUser: User;
    const lowerEmail = email.toLowerCase().trim();

    if (specificRole) {
      matchedUser = {
        ...DEFAULT_USERS[specificRole],
        email: lowerEmail,
      };
    } else if (lowerEmail.includes('admin')) {
      matchedUser = { ...DEFAULT_USERS.admin, email: lowerEmail };
    } else if (lowerEmail.includes('staff') || lowerEmail.includes('sales')) {
      matchedUser = { ...DEFAULT_USERS.staff, email: lowerEmail };
    } else {
      matchedUser = { ...DEFAULT_USERS.customer, email: lowerEmail };
    }

    setUser(matchedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));
    setIsLoading(false);
    return true;
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(data);
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('[Auth] Backend signup fallback to local account:', err);
    }

    const role = data.role || 'customer';
    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      role,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      organization: data.organization || (role === 'admin' ? 'Brightloop Admin Team' : role === 'staff' ? 'Brightloop Sales Ops' : 'Customer Account'),
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    const template = DEFAULT_USERS[newRole];
    const rawClean = sanitizeName(user?.name);
    
    // If the current session uses one of the demo personas or has no name, switch fully to the target persona
    const isDefaultPersona = !rawClean || DEFAULT_PERSONA_NAMES.includes(rawClean.toLowerCase());
    
    const updated: User = isDefaultPersona
      ? { ...template }
      : {
          ...template,
          id: user?.id || template.id,
          name: rawClean,
          email: user?.email || template.email,
          role: newRole,
          organization: user?.organization || template.organization,
        };

    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist switch to backend
    authApi.switchRole(newRole).catch((err) =>
      console.warn('[Auth] Backend switch-role notice:', err)
    );
  }, [user]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const res = await authApi.resetPassword(email);
      if (res && res.previewToken) {
        const newReq: ResetPasswordRequest = {
          email,
          timestamp: new Date().toISOString(),
          token: res.previewToken,
        };
        setResetRequests((prev) => [newReq, ...prev]);
        return res;
      }
    } catch (err) {
      console.warn('[Auth] Backend reset fallback:', err);
    }

    const token = 'rst_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    const newReq: ResetPasswordRequest = {
      email,
      timestamp: new Date().toISOString(),
      token,
    };
    setResetRequests((prev) => [newReq, ...prev]);
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${email}`,
      previewToken: token,
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        requestPasswordReset,
        resetRequests,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
