import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Eye, Code2, Sparkles } from "lucide-react";
import { themes, getThemeTokens } from "@/lib/themes";

export default function HomePage() {
  const getThemePrimaryColor = (themeKey: string) => {
    const tokens = getThemeTokens(themeKey, "light");
    return tokens["--primary"] || "hsl(var(--primary))";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-12 space-y-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            Production-Ready Theme System
          </div>
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Theme Reference System
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Explore comprehensive theme specimens across different industries.
            Each theme showcases production-ready UI patterns with distinct
            visual identities and interaction philosophies.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/styleguide/theme-reference/fintech">
                <Eye className="w-4 h-4" />
                Explore Themes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-transparent"
            >
              <Code2 className="w-4 h-4" />
              View Documentation
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(themes).map(([key, theme]) => {
            const primaryColor = getThemePrimaryColor(key);
            const secondaryColor =
              getThemeTokens(key, "light")["--muted"] || "hsl(var(--muted))";

            return (
              <Link
                key={key}
                href={`/styleguide/theme-reference/${key}` as any}
                className="group"
              >
                <Card className="h-full hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-lg shadow-sm ring-1 ring-black/5"
                            style={{ backgroundColor: primaryColor }}
                          />

                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {theme.label}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {theme.name}
                        </Badge>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {theme.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Primary Colors
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="w-8 h-8 rounded-md shadow-sm ring-1 ring-black/5"
                            style={{ backgroundColor: primaryColor }}
                            title="Primary"
                          />

                          <div
                            className="w-8 h-8 rounded-md shadow-sm ring-1 ring-black/5"
                            style={{ backgroundColor: secondaryColor }}
                            title="Secondary"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Theme
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="w-8 h-8 rounded-md shadow-sm ring-1 ring-black/5"
                            style={{
                              backgroundColor:
                                getThemeTokens(key, "light")["--accent"] ||
                                primaryColor,
                            }}
                            title="Accent"
                          />

                          <div
                            className="w-8 h-8 rounded-md shadow-sm ring-1 ring-black/5"
                            style={{
                              backgroundColor:
                                getThemeTokens(key, "light")["--border"] ||
                                "hsl(var(--border))",
                            }}
                            title="Border"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Color Scale
                        </span>
                        <span className="font-medium">
                          {theme.primary.light}/{theme.primary.dark}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <Card className="p-8 border-0 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Design System Features</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />

                  <span>
                    Semantic CSS variables with automatic theme adaptation
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />

                  <span>
                    Production-ready components with accessibility built-in
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />

                  <span>
                    Industry-specific color palettes and interaction patterns
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />

                  <span>Comprehensive light and dark mode support</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-0 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Eye className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">What You'll See</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full" />

                  <span>
                    Complete app specimens with realistic data and interactions
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full" />

                  <span>
                    Token panels showing CSS variable mappings to Radix colors
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full" />

                  <span>
                    Design guidance with philosophy and implementation notes
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full" />

                  <span>Side-by-side light and dark mode comparisons</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
