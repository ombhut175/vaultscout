"use client";

import React from "react";
import { AppNavigation } from "@/components/app-navigation";
import { useAuthProtection } from "@/components/auth/auth-provider";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

export default function OtherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Protect all routes under (other) group - redirect to login if not authenticated
  const { shouldRender, isLoading } = useAuthProtection(ROUTES.AUTH.LOGIN);

  React.useEffect(() => {
    hackLog.componentMount('OtherLayout', {
      isLoading,
      shouldRender,
      protection: 'auth_required'
    });
  }, [isLoading, shouldRender]);

  // Show loading state while checking authentication
  if (isLoading || !shouldRender) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Verifying authentication...
          </span>
        </div>
      </div>
    );
  }

  // Only render if authenticated
  return (
    <div className="flex flex-col min-h-screen">
      <AppNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
