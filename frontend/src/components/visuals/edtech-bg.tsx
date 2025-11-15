"use client";

import { motion } from "framer-motion";

export function EdtechBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.span
        aria-hidden
        className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        initial={{ y: -8, x: 0, opacity: 0.9 }}
        animate={{ y: [-8, 8, -8], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.span
        aria-hidden
        className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-500/16 blur-[96px]"
        initial={{ y: 6, x: 0, opacity: 0.9 }}
        animate={{ y: [6, -6, 6], x: [0, -8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.span
        aria-hidden
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/20 blur-[72px]"
        initial={{ y: 0, x: 0, opacity: 0.8 }}
        animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
