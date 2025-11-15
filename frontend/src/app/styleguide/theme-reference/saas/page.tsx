import { Specimen } from "@/components/patterns/Specimen";
import { themes, getThemeTokens } from "@/lib/themes";

export default function SaasThemePage() {
  const theme = "saas";
  const themeConfig = themes[theme];
  const lightTokens = getThemeTokens(theme, "light");
  const darkTokens = getThemeTokens(theme, "dark");

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          SaaS Theme Reference
        </h1>
        <p className="text-muted-foreground text-pretty">
          {themeConfig.description}
        </p>
      </div>

      {/* Light Mode Specimen */}
      <Specimen
        title="SaaS"
        theme={theme}
        mode="light"
        tokens={lightTokens}
        guidance={themeConfig.guidance}
      />

      {/* Dark Mode Specimen */}
      <Specimen
        title="SaaS"
        theme={theme}
        mode="dark"
        tokens={darkTokens}
        guidance={themeConfig.guidance}
      />

      <footer className="mt-12 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Dashboard-Optimized Layouts</h3>
        <p className="text-sm text-muted-foreground">
          SaaS themes prioritize data density and clean visualization. Minimal
          chrome allows maximum focus on content and functionality.
        </p>
      </footer>
    </div>
  );
}
