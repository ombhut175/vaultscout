// 🚨 VALIDATION HELPERS - USE FOR ALL FORM VALIDATION
// This file provides validation utilities for forms

import { FORM_MESSAGES } from '@/constants/string-const';
import hackLog from '@/lib/logger';

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Email validation
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return FORM_MESSAGES.EMAIL_REQUIRED;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return FORM_MESSAGES.EMAIL_INVALID;
  }
  
  return null;
}

// Password validation
export function validatePassword(password: string): string | null {
  if (!password || !password.trim()) {
    return FORM_MESSAGES.PASSWORD_REQUIRED;
  }
  
  if (password.length < 8) {
    return FORM_MESSAGES.PASSWORD_MIN_LENGTH;
  }
  
  return null;
}

// Confirm password validation
export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword || !confirmPassword.trim()) {
    return FORM_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  }
  
  if (password !== confirmPassword) {
    return FORM_MESSAGES.PASSWORDS_DONT_MATCH;
  }
  
  return null;
}

// Required field validation
export function validateRequired(value: string | null | undefined, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

// Min length validation
export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

// Max length validation
export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }
  return null;
}

// URL validation
export function validateUrl(url: string): string | null {
  if (!url || !url.trim()) {
    return 'URL is required';
  }
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
}

// Number validation
export function validateNumber(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  
  if (isNaN(Number(value))) {
    return `${fieldName} must be a valid number`;
  }
  
  return null;
}

// Min value validation
export function validateMinValue(value: number, minValue: number, fieldName: string): string | null {
  if (value < minValue) {
    return `${fieldName} must be at least ${minValue}`;
  }
  return null;
}

// Max value validation
export function validateMaxValue(value: number, maxValue: number, fieldName: string): string | null {
  if (value > maxValue) {
    return `${fieldName} must be at most ${maxValue}`;
  }
  return null;
}

// Generic form validator
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => string | null>
): ValidationResult {
  const errors: Record<string, string> = {};
  
  for (const field in rules) {
    const error = rules[field](data[field]);
    if (error) {
      errors[field] = error;
    }
  }
  
  const isValid = Object.keys(errors).length === 0;
  
  if (!isValid) {
    hackLog.formValidation('Form validation failed', errors);
  }
  
  return { isValid, errors };
}

// Extract backend validation errors
export function extractBackendValidationErrors(error: any): Record<string, string> | null {
  hackLog.dev('Extracting backend validation errors', { error });
  
  // Check if it's an axios error with response
  if (error?.response?.data) {
    const data = error.response.data;
    
    // NestJS class-validator format: { message: string[], error: string, statusCode: number }
    if (Array.isArray(data.message)) {
      const errors: Record<string, string> = {};
      data.message.forEach((msg: string) => {
        // Try to parse field-specific errors (format: "field: error message")
        const match = msg.match(/^(\w+):\s*(.+)$/);
        if (match) {
          errors[match[1]] = match[2];
        } else {
          // Generic error
          errors._general = msg;
        }
      });
      return errors;
    }
    
    // Alternative format: { errors: { field: string[] } }
    if (data.errors && typeof data.errors === 'object') {
      const errors: Record<string, string> = {};
      for (const field in data.errors) {
        const fieldErrors = data.errors[field];
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          errors[field] = fieldErrors[0];
        } else if (typeof fieldErrors === 'string') {
          errors[field] = fieldErrors;
        }
      }
      return errors;
    }
    
    // Single message format
    if (data.message && typeof data.message === 'string') {
      return { _general: data.message };
    }
  }
  
  return null;
}

// Combine frontend and backend validation errors
export function mergeValidationErrors(
  frontendErrors: Record<string, string>,
  backendErrors: Record<string, string> | null
): Record<string, string> {
  if (!backendErrors) {
    return frontendErrors;
  }
  
  return { ...frontendErrors, ...backendErrors };
}
