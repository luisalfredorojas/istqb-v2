/**
 * Validation utilities for authentication forms
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'El email es requerido',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Email inválido',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates password strength
 * Requirements: Min 6 characters, must contain letters and digits
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      error: 'La contraseña es requerida',
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'La contraseña debe tener al menos 6 caracteres',
    };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasLetter || !hasDigit) {
    return {
      isValid: false,
      error: 'La contraseña debe contener letras y números',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates that two passwords match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Las contraseñas no coinciden',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates OTP code (6 digits)
 */
export function validateOTP(otp: string): ValidationResult {
  if (!otp || otp.trim() === '') {
    return {
      isValid: false,
      error: 'El código es requerido',
    };
  }

  if (otp.length !== 6) {
    return {
      isValid: false,
      error: 'El código debe tener 6 dígitos',
    };
  }

  if (!/^\d{6}$/.test(otp)) {
    return {
      isValid: false,
      error: 'El código debe contener solo números',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong';
  score: number;
} {
  let score = 0;

  // Length
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { level: 'weak', score };
  if (score <= 5) return { level: 'medium', score };
  return { level: 'strong', score };
}
