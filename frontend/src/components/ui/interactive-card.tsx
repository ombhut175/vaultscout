"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type InteractiveCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "premium" | "glass" | "elevated";
  tilt?: boolean;
  glow?: boolean;
  animatedBorder?: boolean;
  onClick?: () => void;
};

// Hook: interactive 3D tilt + cursor glow
function useInteractiveCard() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rx = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-4, 4]), { stiffness: 150, damping: 16 });

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

  return { ref, rx, ry, onMouseMove, onMouseLeave } as const;
}

export function InteractiveCard({
  children,
  className,
  variant = "glass",
  tilt = true,
  glow = true,
  animatedBorder = false,
  onClick,
}: InteractiveCardProps) {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useInteractiveCard();

  const baseStyles = "relative overflow-hidden transition-all";
  
  const variantStyles = {
    premium: "rounded-[22px] border border-black/8 bg-white/50 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/40 dark:ring-white/10",
    glass: "rounded-xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-slate-900/40 backdrop-blur-md",
    elevated: "rounded-lg border border-black/5 bg-white/40 shadow-lg ring-1 ring-black/5 backdrop-blur-xl hover:shadow-xl hover:border-primary/20 dark:border-white/10 dark:bg-slate-900/30 dark:ring-white/10",
  };

  const cardContent = (
    <>
      {/* Animated gradient frame */}
      {animatedBorder && (
        <div aria-hidden className="pointer-events-none absolute -inset-[1.5px] rounded-[inherit]">
          <motion.div
            className="absolute inset-0 rounded-[inherit] opacity-40"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.25), rgba(99,102,241,0.15), rgba(99,102,241,0.25))",
              filter: "blur(12px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Reactive glow */}
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(280px 280px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.15), transparent 65%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Bottom accent line */}
      {variant === "premium" && (
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      )}
    </>
  );

  if (!tilt) {
    return (
      <div
        className={cn("group", baseStyles, variantStyles[variant], className)}
        onClick={onClick}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={cn("group will-change-transform", baseStyles, variantStyles[variant], className)}
      onClick={onClick}
    >
      {cardContent}
    </motion.div>
  );
}