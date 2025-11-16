"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type PremiumPageLayoutProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as any },
  },
};

export function PremiumPageLayout({
  icon: Icon,
  title,
  description,
  actions,
  children,
}: PremiumPageLayoutProps) {
  return (
    <div className="relative min-h-full bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100 overflow-hidden">
      {/* Premium background with grid and gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--color-border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--color-border)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "-1px -1px",
          }}
        />
        
        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {Icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {title}
                </h1>
              </div>
              {description && (
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </motion.div>

        {/* Page Content */}
        {children}
      </motion.div>
    </div>
  );
}

// Export motion variants for child components
export { containerVariants, itemVariants };