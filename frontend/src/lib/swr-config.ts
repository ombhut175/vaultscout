import { SWRConfiguration } from 'swr';
import hackLog from './logger';

/**
 * Global SWR configuration
 * Optimized for performance and user experience
 */
export const swrConfig: SWRConfiguration = {
  // Caching configuration
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  
  // Revalidation configuration
  revalidateOnFocus: false, // Don't revalidate when window regains focus
  revalidateOnReconnect: true, // Revalidate when network reconnects
  revalidateIfStale: true, // Revalidate if data is stale
  
  // Error retry configuration
  errorRetryCount: 3, // Retry failed requests up to 3 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
  shouldRetryOnError: true, // Enable error retry
  
  // Loading configuration
  loadingTimeout: 3000, // Show loading state after 3 seconds
  
  // Error handler
  onError: (error, key) => {
    hackLog.error('SWR Error', {
      error: error.message,
      key,
      component: 'SWR',
      timestamp: Date.now()
    });
  },
  
  // Success handler
  onSuccess: (data, key) => {
    hackLog.dev('SWR Success', {
      key,
      hasData: !!data,
      component: 'SWR',
      timestamp: Date.now()
    });
  },
  
  // Loading state handler
  onLoadingSlow: (key) => {
    hackLog.dev('SWR Loading Slow', {
      key,
      component: 'SWR',
      timestamp: Date.now()
    });
  }
};

/**
 * SWR configuration with custom stale time
 * Use this for data that doesn't change frequently
 * 
 * @param staleTime - Time in milliseconds before data is considered stale (default: 5 minutes)
 */
export function getSwrConfigWithStaleTime(staleTime: number = 5 * 60 * 1000): SWRConfiguration {
  return {
    ...swrConfig,
    dedupingInterval: Math.min(staleTime, 2000), // Don't exceed 2 seconds for deduping
    // Note: SWR doesn't have a built-in staleTime option like React Query
    // We can simulate it by controlling revalidation
    revalidateIfStale: true,
    focusThrottleInterval: staleTime, // Throttle focus revalidation
  };
}

/**
 * SWR configuration for real-time data
 * Use this for data that changes frequently
 */
export const swrRealtimeConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 0, // No deduping for real-time data
  revalidateOnFocus: true, // Revalidate on focus for real-time data
  refreshInterval: 30000, // Refresh every 30 seconds
};

/**
 * SWR configuration for static data
 * Use this for data that rarely changes
 */
export const swrStaticConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 60000, // Dedupe for 1 minute
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
};
