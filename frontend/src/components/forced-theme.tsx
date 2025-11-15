"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface ForcedThemeProps {
  theme: string;
  mode: "light" | "dark";
  children: React.ReactNode;
  className?: string;
}

export function ForcedTheme({
  theme,
  mode,
  children,
  className = "",
}: ForcedThemeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`min-h-[600px] bg-muted/20 animate-pulse rounded-lg ${className}`}
      >
        <div className="p-6 space-y-4">
          <div className="h-8 bg-muted/40 rounded w-1/3"></div>
          <div className="h-4 bg-muted/30 rounded w-2/3"></div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-24 bg-muted/40 rounded"></div>
            <div className="h-24 bg-muted/40 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const themeClass = `theme-${theme}`;
  const modeClass = mode === "dark" ? "dark" : "";
  const combinedClasses = `${themeClass} ${modeClass}`.trim();

  return (
    <div
      className={`${combinedClasses} ${className}`}
      data-theme={theme}
      data-mode={mode}
    >
      {children}
    </div>
  );
}
