// 🚨 MANDATORY FILE - ALL ERROR HANDLING MUST USE THIS FILE
// This file handles ALL error processing in the application
// NO inline error handling allowed anywhere else

import { ERROR_MESSAGES } from '@/constants/messages';
import { toast } from 'sonner'; // Using sonner for toast notifications
import hackLog from '@/lib/logger';

// Error handling options
interface ErrorHandlingOptions {
  toast?: boolean;
  fallbackMessage?: string;
  logToConsole?: boolean;
  suppressConsoleError?: boolean;
}

// Extract meaningful error message from any error type
export function extractErrorMessage(error: unknown, fallback?: string): string {
  const defaultFallback = fallback || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
  hackLog.error('Extracting error message', { error, fallback });

  // Network/Fetch API errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Timeout errors
  if (error instanceof Error && error.name === 'TimeoutError') {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // API Response errors (when we get a response but it's an error)
  if (error instanceof Error && error.message.startsWith('API Error:')) {
    // Try to parse backend error message
    try {
      const errorParts = error.message.split(' - ');
      if (errorParts.length > 1) {
        const backendMessage = errorParts.slice(1).join(' - ');
        // Try to parse JSON if it looks like JSON
        if (backendMessage.startsWith('{') && backendMessage.endsWith('}')) {
          const parsed = JSON.parse(backendMessage);
          if (parsed.message) return String(parsed.message);
          if (parsed.error) return String(parsed.error);
        }
        return backendMessage;
      }
    } catch {
      // If parsing fails, use the original message
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    return error.message || defaultFallback;
  }

  // String errors
  if (typeof error === 'string') {
    return error;
  }

  // Object errors (try to extract message)
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    if (errorObj.message) return String(errorObj.message);
    if (errorObj.error) return String(errorObj.error);
    if (errorObj.statusText) return String(errorObj.statusText);
    
    // Try to stringify if it has useful info
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}' && stringified.length < 200) {
        return stringified;
      }
    } catch {
      // Ignore JSON stringify errors
    }
  }

  return defaultFallback;
}

// 🚨 MAIN ERROR HANDLER - USE THIS EVERYWHERE
export function handleError(error: unknown, options: ErrorHandlingOptions = {}) {
  const {
    toast: showToast = true,
    fallbackMessage = ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    logToConsole = true,
    suppressConsoleError = false,
  } = options;

  const message = extractErrorMessage(error, fallbackMessage);

  // Console logging
  if (logToConsole && !suppressConsoleError) {
    hackLog.error('Error handler called', {
      message,
      originalError: error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  // Toast notification
  if (showToast) {
    toast.error(message);
  }

  return message;
}

// 🚨 ASYNC ERROR WRAPPER - USE FOR ALL ASYNC FUNCTIONS
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: ErrorHandlingOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, options);
      throw error; // Re-throw so calling code can handle it too if needed
    }
  }) as T;
}

// 🚨 PROMISE ERROR CATCHER - USE WITH PROMISES
export async function catchErrors<T>(
  promise: Promise<T>,
  options: ErrorHandlingOptions = {}
): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    handleError(error, options);
    return null;
  }
}