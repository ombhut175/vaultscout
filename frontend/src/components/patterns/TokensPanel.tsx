"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Palette, Code2, Eye } from "lucide-react";
import { useState } from "react";

interface TokensPanelProps {
  theme: string;
  mode: "light" | "dark";
  tokens: Record<string, string>;
  className?: string;
}

export function TokensPanel({
  theme,
  mode,
  tokens,
  className = "",
}: TokensPanelProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = async (text: string, tokenName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const tokenCategories = {
    "Background & Surface": {
      icon: <Palette className="w-4 h-4" />,
      tokens: {
        "--background": "Base background color for the entire application",
        "--card": "Card and elevated surface background color",
        "--popover": "Popover and dropdown background color",
      },
    },
    "Text & Foreground": {
      icon: <Code2 className="w-4 h-4" />,
      tokens: {
        "--foreground": "Primary text color for body content",
        "--card-foreground": "Text color for content on card surfaces",
        "--popover-foreground": "Text color for popover content",
        "--muted-foreground": "Secondary text color for less important content",
      },
    },
    "Interactive Elements": {
      icon: <Eye className="w-4 h-4" />,
      tokens: {
        "--primary": "Primary brand color for buttons and key actions",
        "--primary-foreground": "Text color on primary colored backgrounds",
        "--secondary": "Secondary background for subtle actions",
        "--secondary-foreground": "Text color on secondary backgrounds",
        "--accent": "Accent color for highlights and emphasis",
        "--accent-foreground": "Text color on accent colored backgrounds",
      },
    },
    "States & Feedback": {
      icon: <Palette className="w-4 h-4" />,
      tokens: {
        "--destructive": "Error and danger state color",
        "--destructive-foreground": "Text color for destructive actions",
        "--muted": "Muted background for disabled or inactive states",
        "--border": "Default border color for components",
        "--input": "Border color for form inputs",
        "--ring": "Focus ring color for accessibility",
      },
    },
    Layout: {
      icon: <Code2 className="w-4 h-4" />,
      tokens: {
        "--radius": "Border radius value for consistent rounded corners",
      },
    },
  };

  const getRadixScale = (
    tokenName: string,
    themeKey: string,
    mode: "light" | "dark",
  ) => {
    const radixMappings: Record<
      string,
      Record<string, { scale: string; step: string }>
    > = {
      fintech: {
        "--primary": { scale: "jade", step: mode === "light" ? "9" : "8" },
        "--secondary": { scale: "jade", step: mode === "light" ? "3" : "4" },
        "--accent": { scale: "emerald", step: mode === "light" ? "6" : "7" },
        "--background": {
          scale: mode === "light" ? "white" : "gray",
          step: mode === "light" ? "" : "1",
        },
        "--foreground": { scale: "gray", step: "12" },
        "--border": { scale: "gray", step: mode === "light" ? "6" : "7" },
        "--muted": { scale: "gray", step: mode === "light" ? "2" : "3" },
        "--destructive": { scale: "red", step: mode === "light" ? "9" : "8" },
        "--ring": { scale: "jade", step: mode === "light" ? "7" : "8" },
      },
      health: {
        "--primary": { scale: "teal", step: mode === "light" ? "9" : "8" },
        "--secondary": { scale: "mint", step: mode === "light" ? "3" : "4" },
        "--accent": { scale: "cyan", step: mode === "light" ? "6" : "7" },
        "--background": {
          scale: mode === "light" ? "white" : "gray",
          step: mode === "light" ? "" : "1",
        },
        "--foreground": { scale: "gray", step: "12" },
        "--border": { scale: "gray", step: mode === "light" ? "6" : "7" },
        "--muted": { scale: "gray", step: mode === "light" ? "2" : "3" },
        "--destructive": { scale: "red", step: mode === "light" ? "9" : "8" },
        "--ring": { scale: "teal", step: mode === "light" ? "7" : "8" },
      },
      edtech: {
        "--primary": { scale: "violet", step: mode === "light" ? "9" : "8" },
        "--secondary": { scale: "indigo", step: mode === "light" ? "3" : "4" },
        "--accent": { scale: "purple", step: mode === "light" ? "6" : "7" },
        "--background": {
          scale: mode === "light" ? "white" : "gray",
          step: mode === "light" ? "" : "1",
        },
        "--foreground": { scale: "gray", step: "12" },
        "--border": { scale: "gray", step: mode === "light" ? "6" : "7" },
        "--muted": { scale: "gray", step: mode === "light" ? "2" : "3" },
        "--destructive": { scale: "red", step: mode === "light" ? "9" : "8" },
        "--ring": { scale: "violet", step: mode === "light" ? "7" : "8" },
      },
      ecommerce: {
        "--primary": { scale: "amber", step: mode === "light" ? "9" : "8" },
        "--secondary": { scale: "orange", step: mode === "light" ? "3" : "4" },
        "--accent": { scale: "yellow", step: mode === "light" ? "6" : "7" },
        "--background": {
          scale: mode === "light" ? "white" : "gray",
          step: mode === "light" ? "" : "1",
        },
        "--foreground": { scale: "gray", step: "12" },
        "--border": { scale: "gray", step: mode === "light" ? "6" : "7" },
        "--muted": { scale: "gray", step: mode === "light" ? "2" : "3" },
        "--destructive": { scale: "red", step: mode === "light" ? "9" : "8" },
        "--ring": { scale: "amber", step: mode === "light" ? "7" : "8" },
      },
      saas: {
        "--primary": { scale: "blue", step: mode === "light" ? "9" : "8" },
        "--secondary": { scale: "sky", step: mode === "light" ? "3" : "4" },
        "--accent": { scale: "cyan", step: mode === "light" ? "6" : "7" },
        "--background": {
          scale: mode === "light" ? "white" : "gray",
          step: mode === "light" ? "" : "1",
        },
        "--foreground": { scale: "gray", step: "12" },
        "--border": { scale: "gray", step: mode === "light" ? "6" : "7" },
        "--muted": { scale: "gray", step: mode === "light" ? "2" : "3" },
        "--destructive": { scale: "red", step: mode === "light" ? "9" : "8" },
        "--ring": { scale: "blue", step: mode === "light" ? "7" : "8" },
      },
      social: {
        "--primary": { scale: "pink", step: mode === "light" ? "9" : "8" },
        "--secondary": { scale: "plum", step: mode === "light" ? "3" : "4" },
        "--accent": { scale: "crimson", step: mode === "light" ? "6" : "7" },
        "--background": {
          scale: mode === "light" ? "white" : "gray",
          step: mode === "light" ? "" : "1",
        },
        "--foreground": { scale: "gray", step: "12" },
        "--border": { scale: "gray", step: mode === "light" ? "6" : "7" },
        "--muted": { scale: "gray", step: mode === "light" ? "2" : "3" },
        "--destructive": { scale: "red", step: mode === "light" ? "9" : "8" },
        "--ring": { scale: "pink", step: mode === "light" ? "7" : "8" },
      },
    };

    const mapping = radixMappings[themeKey]?.[tokenName];
    return mapping
      ? `${mapping.scale}${mapping.step ? `-${mapping.step}` : ""}`
      : "gray-6";
  };

  return (
    <TooltipProvider>
      <Card
        className={`${className} border-0 shadow-lg bg-card/50 backdrop-blur-sm`}
        data-testid="tokens-panel"
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <span>Design Tokens</span>
            </div>
            <Badge variant="outline" className="capitalize bg-background/50">
              {mode} Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(tokenCategories).map(
            ([category, { icon, tokens: categoryTokens }]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">{icon}</div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {category}
                  </h4>
                </div>
                <div className="grid gap-3">
                  {Object.entries(categoryTokens).map(
                    ([tokenName, description]) => {
                      const tokenValue = tokens[tokenName];
                      const radixScale = getRadixScale(tokenName, theme, mode);
                      const isColorToken = tokenName !== "--radius";

                      return (
                        <div key={tokenName} className="group relative">
                          <div className="flex items-center justify-between p-4 rounded-lg border bg-background/30 hover:bg-background/50 transition-all duration-200 hover:shadow-md">
                            <div className="flex items-center space-x-4 flex-1">
                              {isColorToken && (
                                <div className="relative">
                                  <div
                                    className="w-10 h-10 rounded-lg shadow-sm ring-1 ring-black/5 flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        tokenValue || "transparent",
                                    }}
                                  />

                                  {tokenValue && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border-2 border-background shadow-sm" />
                                  )}
                                </div>
                              )}
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono font-medium text-foreground bg-muted/50 px-2 py-1 rounded">
                                    {tokenName}
                                  </code>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() =>
                                          copyToClipboard(tokenName, tokenName)
                                        }
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {copiedToken === tokenName
                                        ? "Copied!"
                                        : "Copy token name"}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-2 flex-shrink-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-mono cursor-help bg-primary/10 text-primary hover:bg-primary/20"
                                  >
                                    {radixScale}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Radix UI color scale mapping</p>
                                </TooltipContent>
                              </Tooltip>
                              {tokenValue && (
                                <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                                  {tokenValue}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
                {category !== "Layout" && <Separator className="opacity-30" />}
              </div>
            ),
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
