"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, GraduationCap, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

// Simplified layout for auth routes: minimal header with back to home button
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    hackLog.componentMount('AuthLayout', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative min-h-dvh bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100">
        {/* Background visuals */}
        <BackgroundAura />

        {/* Minimal Header */}
        <Header />

        {/* Page container with subtle entrance */}
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={(typeof window !== "undefined" && window.location.pathname) || "auth"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="px-4 py-10 md:px-6 md:py-14 lg:py-16"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </NextThemesProvider>
  );
}

// Minimal header with just brand and theme toggle
function Header() {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-border bg-card/70 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        
        {/* Back to Home + Brand */}
        <div className="flex items-center gap-4">
          <Link 
            href={ROUTES.HOME} 
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="h-4 w-px bg-border" />
          
          <Link href={ROUTES.HOME} className="group inline-flex items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary shadow-sm ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-primary-foreground drop-shadow" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight text-foreground">VaultScout</span>
              <span className="text-xs text-muted-foreground">Search Platform</span>
            </div>
          </Link>
        </div>

        {/* Just theme toggle - no auth navigation needed since user is already on auth pages */}
        <div className="flex items-center gap-3">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

// Theme toggle with subtle micro-interactions
function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary text-secondary-foreground shadow-sm transition-all hover:shadow-md"
    >
      <motion.span
        key={isDark ? "dark" : "light"}
        initial={{ y: 8, opacity: 0, rotate: -6 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: -8, opacity: 0, rotate: 6 }}
        transition={{ duration: 0.25 }}
        className="grid place-items-center"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.span>

      {/* Glow */}
      <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(120px_circle_at_var(--x,50%)_var(--y,50%),rgba(99,102,241,0.25),transparent_70%)] group-hover:opacity-100" />
    </motion.button>
  );
}

// Premium background effects with grid, gradient, and glow
function BackgroundAura() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft radial gradient blobs - enterprise minimal */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--color-border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--color-border)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "-1px -1px",
        }}
      />

      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-[64px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
