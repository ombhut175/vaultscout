"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type PremiumSectionHeaderProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
};

export function PremiumSectionHeader({
  icon: Icon,
  title,
  description,
  badge,
  actions,
}: PremiumSectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative"
          >
            {/* Animated glow */}
            <motion.div
              className="absolute -inset-2 rounded-xl bg-primary/20 blur-lg"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Icon className="h-6 w-6 text-primary-foreground drop-shadow" />
            </div>
          </motion.div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {title}
            </h2>
            {badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20"
              >
                {badge}
              </motion.span>
            )}
          </div>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-2 text-base text-muted-foreground max-w-2xl"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
      
      {actions && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {actions}
        </motion.div>
      )}
    </motion.div>
  );
}