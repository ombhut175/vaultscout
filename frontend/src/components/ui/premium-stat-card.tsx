"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PremiumStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  index?: number;
  className?: string;
};

export function PremiumStatCard({
  icon: Icon,
  label,
  value,
  change,
  trend = "neutral",
  index = 0,
  className,
}: PremiumStatCardProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rx = useSpring(useTransform(my, [0, 1], [3, -3]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-3, 3]), { stiffness: 150, damping: 16 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mx.set(x);
    my.set(y);
    el.style.setProperty("--x", `${x * 100}%`);
    el.style.setProperty("--y", `${y * 100}%`);
  }

  function onMouseLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      whileHover={{ y: -6 }}
      className={cn("group relative will-change-transform", className)}
    >
      {/* Animated gradient border */}
      <div aria-hidden className="pointer-events-none absolute -inset-[1px] rounded-[20px]">
        <motion.div
          className="absolute inset-0 rounded-[20px] opacity-40"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.3), rgba(99,102,241,0.15), rgba(99,102,241,0.3))",
            filter: "blur(10px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-[18px] border border-black/10 bg-white/70 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/50 dark:ring-white/10">
        {/* Reactive glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(200px 200px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.2), transparent 70%)",
          }}
        />

        <div className="relative z-10 space-y-4">
          {/* Icon and Label */}
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20 group-hover:from-primary/30 group-hover:to-primary/15 transition-all">
              <Icon className="h-6 w-6" />
            </div>
            {change && (
              <span className={cn("text-sm font-semibold", trendColors[trend])}>
                {change}
              </span>
            )}
          </div>

          {/* Value */}
          <div>
            <motion.div
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {value}
            </motion.div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
}