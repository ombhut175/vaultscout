'use client';

import { useEffect } from 'react';
import hackLog from '@/lib/logger';

/**
 * Logger Initialization Component
 * Initializes Nexlog on the client side
 */
export function LoggerInit() {
  useEffect(() => {
    hackLog.info('Application starting - Client Side', { 
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Log performance metrics if available
    if (window.performance && window.performance.navigation) {
      hackLog.performanceStart('Page Load');
      
      window.addEventListener('load', () => {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        hackLog.performanceEnd('Page Load', loadTime);
      });
    }

    // Log errors globally
    const handleError = (event: ErrorEvent) => {
      hackLog.error('Global JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      hackLog.error('Unhandled Promise Rejection', {
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}

export default LoggerInit;
