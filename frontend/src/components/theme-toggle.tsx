"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative h-10 w-10 rounded-xl overflow-hidden border border-border/50 bg-secondary/50 hover:bg-secondary shadow-sm hover:shadow-md transition-all"
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"
          animate={{
            opacity: isDark ? 0.5 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Icons with smooth transitions */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Moon className="h-5 w-5 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Sun className="h-5 w-5 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  );
}