import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Lightbulb,
  Palette,
  Users,
  Zap,
  Target,
  Eye,
  Code2,
} from "lucide-react";

interface GuidanceProps {
  guidance: string[];
  theme: string;
  className?: string;
}

export function Guidance({ guidance, theme, className = "" }: GuidanceProps) {
  const getThemeIcon = (theme: string) => {
    const icons = {
      fintech: <Target className="w-4 h-4" />,
      health: <Users className="w-4 h-4" />,
      edtech: <Lightbulb className="w-4 h-4" />,
      ecommerce: <Zap className="w-4 h-4" />,
      saas: <Code2 className="w-4 h-4" />,
      social: <Eye className="w-4 h-4" />,
    };
    return (
      icons[theme as keyof typeof icons] || <Palette className="w-4 h-4" />
    );
  };

  const getThemePhilosophy = (theme: string) => {
    const philosophies = {
      fintech: {
        title: "Trust & Precision",
        description:
          "Financial interfaces prioritize clarity, security indicators, and data-driven decision making.",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
      },
      health: {
        title: "Care & Accessibility",
        description:
          "Healthcare interfaces emphasize accessibility, calm interactions, and clear information hierarchy.",
        color: "text-teal-600 dark:text-teal-400",
        bg: "bg-teal-50 dark:bg-teal-950/30",
      },
      edtech: {
        title: "Growth & Engagement",
        description:
          "Educational interfaces focus on progress visualization, interactive learning, and motivation.",
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-950/30",
      },
      ecommerce: {
        title: "Conversion & Discovery",
        description:
          "E-commerce interfaces optimize for product discovery, trust signals, and seamless checkout flows.",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/30",
      },
      saas: {
        title: "Efficiency & Scale",
        description:
          "SaaS interfaces prioritize workflow efficiency, data density, and power-user functionality.",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      social: {
        title: "Connection & Expression",
        description:
          "Social interfaces emphasize personal expression, community building, and engaging interactions.",
        color: "text-pink-600 dark:text-pink-400",
        bg: "bg-pink-50 dark:bg-pink-950/30",
      },
    };
    return (
      philosophies[theme as keyof typeof philosophies] || philosophies.saas
    );
  };

  const categorizeGuidance = (guidance: string[]) => {
    const categories = {
      "Visual Design": [] as string[],
      "Interaction Patterns": [] as string[],
      "Content Strategy": [] as string[],
      Accessibility: [] as string[],
    };

    guidance.forEach((item) => {
      if (
        item.toLowerCase().includes("color") ||
        item.toLowerCase().includes("visual") ||
        item.toLowerCase().includes("typography")
      ) {
        categories["Visual Design"].push(item);
      } else if (
        item.toLowerCase().includes("interaction") ||
        item.toLowerCase().includes("hover") ||
        item.toLowerCase().includes("click")
      ) {
        categories["Interaction Patterns"].push(item);
      } else if (
        item.toLowerCase().includes("content") ||
        item.toLowerCase().includes("copy") ||
        item.toLowerCase().includes("messaging")
      ) {
        categories["Content Strategy"].push(item);
      } else if (
        item.toLowerCase().includes("accessibility") ||
        item.toLowerCase().includes("screen reader") ||
        item.toLowerCase().includes("keyboard")
      ) {
        categories["Accessibility"].push(item);
      } else {
        categories["Visual Design"].push(item);
      }
    });

    return categories;
  };

  const philosophy = getThemePhilosophy(theme);
  const categorizedGuidance = categorizeGuidance(guidance);
  const categoryIcons = {
    "Visual Design": <Palette className="w-4 h-4" />,
    "Interaction Patterns": <Zap className="w-4 h-4" />,
    "Content Strategy": <Target className="w-4 h-4" />,
    Accessibility: <Users className="w-4 h-4" />,
  };

  return (
    <Card
      className={`${className} border-0 shadow-lg bg-card/50 backdrop-blur-sm`}
      data-testid="guidance"
    >
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-md">
            {getThemeIcon(theme)}
          </div>
          <span>Design Guidance</span>
          <Badge
            variant="outline"
            className="ml-auto capitalize bg-background/50"
          >
            {theme}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Philosophy Section */}
        <div
          className={`p-6 rounded-xl ${philosophy.bg} border border-current/10`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className={`w-5 h-5 ${philosophy.color}`} />

              <h3 className={`font-semibold ${philosophy.color}`}>
                {philosophy.title}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {philosophy.description}
            </p>
          </div>
        </div>

        {/* Categorized Guidance */}
        {Object.entries(categorizedGuidance).map(([category, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  {category}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </div>
              <div className="grid gap-3">
                {items.map((item, index) => (
                  <div key={index} className="group">
                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/30 hover:bg-background/50 transition-all duration-200 hover:shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />

                      <div className="space-y-1 flex-1">
                        <span className="text-sm leading-relaxed text-foreground font-medium">
                          {item}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="opacity-30" />
            </div>
          );
        })}

        {/* Implementation Notes */}
        <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
          <div className="flex items-start gap-3">
            <Code2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Implementation Notes
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                These guidelines are implemented through semantic CSS variables
                that automatically adapt to the {theme} theme. All interactive
                states, color combinations, and accessibility features follow
                these principles.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
