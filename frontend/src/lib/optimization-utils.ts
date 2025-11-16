import { useCallback, useRef } from 'react';

/**
 * Optimization utilities for React components
 * Provides helpers for memoization and performance optimization
 */

/**
 * Custom hook for stable callback references
 * Similar to useCallback but with automatic dependency tracking
 * 
 * @param callback - The callback function to stabilize
 * @returns Stable callback reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  // Update ref on each render
  callbackRef.current = callback;
  
  // Return stable callback that calls the latest version
  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}

/**
 * Custom hook for deep comparison memoization
 * Use when dependencies are objects or arrays
 * 
 * @param factory - Factory function to create the memoized value
 * @param deps - Dependencies array
 * @returns Memoized value
 */
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T }>(undefined!);
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }
  
  return ref.current.value;
}

/**
 * Deep equality comparison
 * Simple implementation for common cases
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Custom hook for previous value
 * Useful for comparing with previous render
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined!);
  
  // Store current value in ref after render
  const previous = ref.current;
  ref.current = value;
  
  return previous;
}

/**
 * Custom hook for detecting first render
 */
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);
  
  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }
  
  return false;
}

/**
 * Memoization helper for expensive calculations
 * Use this in components that need to compute derived data
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Performance monitoring helper
 * Logs component render time in development
 */
export function useRenderTime(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Longer than one frame (60fps)
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }
  
  return () => {};
}

/**
 * Optimization guidelines for components:
 * 
 * 1. Use React.memo for components that receive the same props frequently
 * 2. Use useMemo for expensive calculations
 * 3. Use useCallback for event handlers passed to child components
 * 4. Use useStableCallback for callbacks that depend on frequently changing values
 * 5. Avoid inline object/array creation in render
 * 6. Use key prop correctly in lists
 * 7. Lazy load heavy components with React.lazy
 * 8. Use virtualization for long lists (react-window, react-virtual)
 */
