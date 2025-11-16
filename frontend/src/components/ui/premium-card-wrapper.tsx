"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type PremiumCardWrapperProps = {
  children: React.ReactNode;
  className?: string;
  index?: number;
  onClick?: () => void;
};

// Hook: interactive 3D tilt + cursor glow
function useInteractiveCard() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 150, damping: 16 });

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

export function PremiumCardWrapper({
  children,
  className,
  index = 0,
  onClick,
}: PremiumCardWrapperProps) {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useInteractiveCard();

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
        delay: index * 0.05,
        ease: [0.2, 0.8, 0.2, 1]
      }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={cn("group relative will-change-transform cursor-pointer", className)}
      onClick={onClick}
    >
      {/* Animated gradient border */}
      <div aria-hidden className="pointer-events-none absolute -inset-[1px] rounded-[18px]">
        <motion.div
          className="absolute inset-0 rounded-[18px] opacity-30"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.2), rgba(99,102,241,0.1), rgba(99,102,241,0.2))",
            filter: "blur(8px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Card with glass effect */}
      <div className="relative overflow-hidden rounded-[16px] border border-black/10 bg-white/60 shadow-lg ring-1 ring-black/5 backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-900/40 dark:ring-white/10">
        {/* Reactive glow on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(240px 240px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.15), transparent 65%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Bottom accent line */}
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
}