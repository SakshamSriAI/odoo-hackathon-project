import { PasswordValidationResult } from '../types/auth';

/**
 * Validates password according to Brightloop Phase 1 requirements:
 * - More than eight characters (> 8 chars, i.e. length >= 9)
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const minLength = password.length > 8; // Strictly > 8 characters
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const criteria = {
    minLength,
    hasUppercase,
    hasLowercase,
    hasSpecialChar,
  };

  const score = [minLength, hasUppercase, hasLowercase, hasSpecialChar].filter(Boolean).length;

  let strengthLabel: PasswordValidationResult['strengthLabel'] = 'Very Weak';
  if (score === 1) strengthLabel = 'Weak';
  else if (score === 2) strengthLabel = 'Medium';
  else if (score === 3) strengthLabel = 'Strong';
  else if (score === 4) strengthLabel = 'Very Strong';

  const isValid = minLength && hasUppercase && hasLowercase && hasSpecialChar;

  return {
    isValid,
    criteria,
    score,
    strengthLabel,
  };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
