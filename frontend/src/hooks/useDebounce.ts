import { useEffect, useState } from 'react';
import hackLog from '@/lib/logger';

/**
 * Custom hook for debouncing values
 * Delays updating the value until after the specified delay
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Log the debounce start
    hackLog.dev('useDebounce: Starting debounce', {
      value,
      delay,
      timestamp: Date.now()
    });

    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      hackLog.dev('useDebounce: Value updated', {
        value,
        delay,
        timestamp: Date.now()
      });
    }, delay);

    // Clean up the timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing callback functions
 * Useful for debouncing event handlers
 * 
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
      hackLog.dev('useDebouncedCallback: Callback executed', {
        delay,
        timestamp: Date.now()
      });
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
