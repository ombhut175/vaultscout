"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

// Props
type AuthCardProps = {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

// Hook: interactive 3D tilt + cursor glow (no generics in TSX)
function useInteractiveCard() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 16 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height; // 0..1
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

// Component: AuthCard with premium motion and visuals
export default function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useInteractiveCard();

  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="group relative will-change-transform"
      >
        {/* Animated gradient frame */}
        <div aria-hidden className="pointer-events-none absolute -inset-[1px] rounded-[22px]">
          <motion.div
            className="absolute inset-0 rounded-[22px] opacity-50"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.2), rgba(99,102,241,0.15), rgba(99,102,241,0.2))",
              filter: "blur(10px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Card (glass) */}
        <div className="relative overflow-hidden rounded-[20px] border border-black/10 bg-white/70 p-6 shadow-2xl ring-1 ring-black/5 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-slate-900/50 dark:ring-white/10 md:p-7">
          {/* Reactive glow (no Tailwind arbitrary SVG to avoid parser edge cases) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(220px 220px at var(--x,50%) var(--y,0%), rgba(99,102,241,0.18), transparent 60%)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-6">
            <header className="flex flex-col gap-1" style={{ transform: "translateZ(40px)" }}>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
              ) : null}
            </header>

            <div className="grid gap-5" style={{ transform: "translateZ(30px)" }}>{children}</div>
          </div>

          {/* bottom accent */}
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        </div>
      </motion.div>

      {footer ? (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">{footer}</div>
      ) : null}
    </div>
  );
}

// Field wrapper with error state ring and smooth halos
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{label}</label>
        {hint && !error ? <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span> : null}
      </div>
      <div
        className={[
          "rounded-xl bg-white/70 p-[2px] transition-all dark:bg-slate-950/60",
          error ? "ring-2 ring-rose-500/40" : "ring-1 ring-black/10 dark:ring-white/10",
        ].join(" ")}
      >
        <div className="rounded-[10px] bg-white/80 p-0.5 shadow-sm transition-colors dark:bg-slate-950/60">{children}</div>
      </div>
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}

// Input with animated focus halo
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="group relative">
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={[
          "h-11 w-full rounded-[10px] border bg-white/90 px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all",
          "border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-transparent dark:bg-slate-950/70 dark:text-slate-100",
          props.className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: focused ? 1 : 0 }}
        className="pointer-events-none absolute -inset-0.5 rounded-[12px] bg-gradient-to-r from-indigo-500/30 to-indigo-500/10 blur-md"
      />
    </div>
  );
}

// Password input with show/hide and halo
export function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="group relative">
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        type={visible ? "text" : "password"}
        className={[
          "h-11 w-full rounded-[10px] border bg-white/90 px-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all",
          "border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-transparent dark:bg-slate-950/70 dark:text-slate-100",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <span className="text-[11px] font-semibold">{visible ? "Hide" : "Show"}</span>
      </button>
      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: focused ? 1 : 0 }}
        className="pointer-events-none absolute -inset-0.5 rounded-[12px] bg-gradient-to-r from-indigo-500/30 to-indigo-500/10 blur-md"
      />
    </div>
  );
}

// Premium submit with shimmer + magnetic glow
export function SubmitButton({ children, loading, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const ref = React.useRef<HTMLButtonElement | null>(null);

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -1, scale: 1.01 }}
      disabled={loading || props.disabled}
      className={[
        "group relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed",
        "shadow-lg shadow-indigo-600/30",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
      {...(props as any)}
    >
      {/* Sheen sweep */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          backgroundSize: "200% 100%",
          mixBlendMode: "overlay",
        }}
      />

      {/* Magnetic glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(140px 140px at var(--x) var(--y), rgba(255,255,255,0.25), transparent 60%)" }}
      />

      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5" />}
      <span className="relative z-10">{children}</span>

      <span aria-hidden className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
    </motion.button>
  );
}

// Muted link
export function MutedLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href as any} className="text-sm text-slate-600 underline-offset-4 transition-all hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white">
      {children}
    </Link>
  );
}
