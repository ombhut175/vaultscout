"use client";

import { ForcedTheme } from "@/components/forced-theme";
import { TokensPanel } from "@/components/patterns/TokensPanel";
import { Guidance } from "@/components/patterns/Guidance";
import { SpecimenPage } from "@/components/patterns/SpecimenPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { themes, type ThemeConfig } from "@/lib/themes";
import {
  Monitor,
  Smartphone,
  Tablet,
  Maximize2,
  Eye,
  Code2,
  Palette,
} from "lucide-react";
import { useState } from "react";

interface SpecimenProps {
  title: string;
  theme: "fintech" | "health" | "edtech" | "ecommerce" | "saas" | "social";
  mode: "light" | "dark";
  tokens: Record<string, string>;
  guidance: string[];
  className?: string;
}

export function Specimen({
  title,
  theme,
  mode,
  tokens,
  guidance,
  className = "",
}: SpecimenProps) {
  const [viewportSize, setViewportSize] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [activeTab, setActiveTab] = useState<
    "specimen" | "tokens" | "guidance"
  >("specimen");
  const themeConfig = themes[theme] as ThemeConfig | undefined;

  const getViewportClasses = () => {
    switch (viewportSize) {
      case "mobile":
        return "max-w-sm mx-auto";
      case "tablet":
        return "max-w-2xl mx-auto";
      default:
        return "w-full";
    }
  };

  const getModeIcon = (mode: "light" | "dark") => {
    return mode === "light" ? "☀️" : "🌙";
  };

  const getThemeColor = (theme: string) => {
    const colors = {
      fintech:
        "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20",
      health:
        "border-teal-200 bg-teal-50/50 dark:border-teal-800 dark:bg-teal-950/20",
      edtech:
        "border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/20",
      ecommerce:
        "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
      saas: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
      social:
        "border-pink-200 bg-pink-50/50 dark:border-pink-800 dark:bg-pink-950/20",
    };
    return colors[theme as keyof typeof colors] || colors.saas;
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className={`p-6 rounded-xl border-2 ${getThemeColor(theme)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl" role="img" aria-label={`${mode} mode`}>
                {getModeIcon(mode)}
              </div>
              <div>
                <h3 className="text-2xl font-bold capitalize tracking-tight">
                  {title} - {mode} Mode
                </h3>
                {themeConfig && (
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl text-pretty">
                    {themeConfig.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize bg-background/50">
              {theme}
            </Badge>
            <Badge
              variant={mode === "light" ? "default" : "secondary"}
              className="capitalize"
            >
              {mode}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Viewport:
          </span>
          <div
            className="flex items-center gap-1 p-1 bg-background/50 rounded-lg"
            role="tablist"
            aria-label="Viewport size selection"
          >
            {[
              { size: "desktop" as const, icon: Monitor, label: "Desktop" },
              { size: "tablet" as const, icon: Tablet, label: "Tablet" },
              { size: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ].map(({ size, icon: Icon, label }) => (
              <Button
                key={size}
                variant={viewportSize === size ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewportSize(size)}
                className="h-8 px-3 gap-2"
                role="tab"
                aria-selected={viewportSize === size}
                aria-controls={`viewport-${size}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />

                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
        <div className="bg-muted/30 px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex gap-1"
              role="img"
              aria-label="Browser window controls"
            >
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {theme}.{mode}.specimen
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            aria-label="Maximize window"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>
        <div className="p-6 bg-background/30">
          <div
            className={`transition-all duration-300 ${getViewportClasses()}`}
            id={`viewport-${viewportSize}`}
          >
            <ForcedTheme
              theme={theme}
              mode={mode}
              className="rounded-lg border overflow-hidden shadow-lg"
            >
              <SpecimenPage title={title} theme={theme} />
            </ForcedTheme>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div
          className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg w-fit"
          role="tablist"
          aria-label="Content sections"
        >
          {[
            { tab: "specimen" as const, icon: Eye, label: "Overview" },
            { tab: "tokens" as const, icon: Code2, label: "Design Tokens" },
            {
              tab: "guidance" as const,
              icon: Palette,
              label: "Design Guidance",
            },
          ].map(({ tab, icon: Icon, label }) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="gap-2"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === "specimen" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <TokensPanel theme={theme} mode={mode} tokens={tokens} />

              <Guidance guidance={guidance} theme={theme} />
            </div>
          )}

          {activeTab === "tokens" && (
            <TokensPanel theme={theme} mode={mode} tokens={tokens} />
          )}

          {activeTab === "guidance" && (
            <Guidance guidance={guidance} theme={theme} />
          )}
        </div>
      </div>

      <Separator className="opacity-30" />
    </div>
  );
}
