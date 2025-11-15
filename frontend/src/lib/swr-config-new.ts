"use client";

import React from 'react';
import { SWRConfig } from 'swr';
import { swrFetcher } from '@/helpers/request'; // 🚨 MUST USE helpers/request
import { APP_CONFIG } from '@/constants/config';
import hackLog from '@/lib/logger';

// Global SWR configuration for hackathon - FOLLOWS RULES
export const swrConfig = {
  fetcher: swrFetcher, // 🚨 Uses helpers/request
  revalidateOnFocus: false, // Don't refetch on window focus (good for demos)
  revalidateOnReconnect: true, // Refetch when internet comes back
  dedupingInterval: 2000, // Prevent duplicate requests for 2 seconds
  errorRetryCount: 2, // Only retry twice on error
  refreshInterval: APP_CONFIG.AUTO_REFRESH_INTERVAL, // From constants
  onError: (error: any) => {
    hackLog.error('SWR Global Error (New Config)', error);
    // Don't use handleError here as it would show duplicate toasts
    // Individual hooks will handle their own errors
  },
  onSuccess: (data: any) => {
    hackLog.info('SWR Global Success (New Config)', {
      dataType: typeof data,
      preview: typeof data === 'object' ? JSON.stringify(data).substring(0, APP_CONFIG.MAX_CONSOLE_LOG_LENGTH) + '...' : data
    });
  }
};

// SWR Provider wrapper
export function SWRProvider({ children }: { children: React.ReactNode }) {
  hackLog.componentMount('SWRProvider (New Config)');
  return React.createElement(SWRConfig, { value: swrConfig }, children);
}
