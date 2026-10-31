export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  organization?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PasswordCriteria {
  minLength: boolean;      // strictly > 8 characters (i.e. length >= 9)
  hasUppercase: boolean;   // at least one uppercase letter
  hasLowercase: boolean;   // at least one lowercase letter
  hasSpecialChar: boolean; // at least one special character
}

export interface PasswordValidationResult {
  isValid: boolean;
  criteria: PasswordCriteria;
  score: number; // 0 to 4
  strengthLabel: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
}

export interface ResetPasswordRequest {
  email: string;
  timestamp: string;
  token?: string;
}
