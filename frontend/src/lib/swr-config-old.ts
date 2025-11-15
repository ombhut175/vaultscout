"use client";

import React from 'react';
import { SWRConfig } from 'swr';
import { swrFetcher } from '@/helpers/request'; // 🚨 MUST USE helpers/request
import hackLog from '@/lib/logger';

// Global SWR configuration for hackathon - FOLLOWS RULES
export const swrConfig = {
  fetcher: swrFetcher, // 🚨 Uses helpers/request
  revalidateOnFocus: false, // Don't refetch on window focus (good for demos)
  revalidateOnReconnect: true, // Refetch when internet comes back
  dedupingInterval: 2000, // Prevent duplicate requests for 2 seconds
  errorRetryCount: 2, // Only retry twice on error
  onError: (error: any) => {
    hackLog.error('SWR Global Error (Old Config)', error);
    // Don't show toast here - let the component handle it or suppress in fetcher
  },
  onSuccess: (data: any) => {
    hackLog.info('SWR Global Success (Old Config)', data);
  }
};

// SWR Provider wrapper
export function SWRProvider({ children }: { children: React.ReactNode }) {
  hackLog.componentMount('SWRProvider (Old Config)');
  return React.createElement(SWRConfig, { value: swrConfig }, children);
}
