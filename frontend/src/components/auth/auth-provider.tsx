/**
 * Auth Provider - Initializes and manages authentication state
 * Checks auth status on app startup and provides auth context to components
 */

"use client";

import * as React from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Initializes auth state on mount and provides loading state during auth check
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuthStatus, isLoading, isInitialized } = useAuthStore();

  React.useEffect(() => {
    if (!isInitialized) {
      hackLog.componentMount('AuthProvider', {
        trigger: 'app_initialization'
      });

      checkAuthStatus().catch((error: any) => {
        hackLog.error('Auth initialization failed', {
          error: error?.message,
          component: 'AuthProvider'
        });
      });
    }
  }, [checkAuthStatus, isInitialized]);

  // Show loading state while initializing auth
  if (!isInitialized && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to protect routes that require authentication
 * Redirects to login if not authenticated
 */
export function useAuthProtection(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  
  React.useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated && !isRedirecting && typeof window !== 'undefined') {
      setIsRedirecting(true);
      
      hackLog.storeAction('authProtectionRedirect', {
        redirectTo,
        reason: 'not_authenticated',
        currentPath: window.location.pathname
      });
      
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, isInitialized, redirectTo, isRedirecting]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender: isAuthenticated && !isLoading && isInitialized && !isRedirecting
  };
}

/**
 * Hook to redirect authenticated users away from auth pages
 * Redirects to dashboard if already authenticated
 */
export function useGuestProtection(redirectTo: string = ROUTES.DASHBOARD) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  
  React.useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && !isRedirecting && typeof window !== 'undefined') {
      setIsRedirecting(true);
      
      hackLog.storeAction('guestProtectionRedirect', {
        redirectTo,
        reason: 'already_authenticated',
        currentPath: window.location.pathname
      });
      
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, isInitialized, redirectTo, isRedirecting]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender: !isAuthenticated && !isLoading && isInitialized && !isRedirecting
  };
}
