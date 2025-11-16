"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-slate-900/40 backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {(title || description || Icon) && (
        <div className="border-b border-black/5 dark:border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={cn("p-6", contentClassName)}>{children}</div>
    </div>
  );
}