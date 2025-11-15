import { Specimen } from "@/components/patterns/Specimen";
import { themes, getThemeTokens } from "@/lib/themes";

export default function SocialThemePage() {
  const theme = "social";
  const themeConfig = themes[theme];
  const lightTokens = getThemeTokens(theme, "light");
  const darkTokens = getThemeTokens(theme, "dark");

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Social Theme Reference
        </h1>
        <p className="text-muted-foreground text-pretty">
          {themeConfig.description}
        </p>
      </div>

      {/* Light Mode Specimen */}
      <Specimen
        title="Social"
        theme={theme}
        mode="light"
        tokens={lightTokens}
        guidance={themeConfig.guidance}
      />

      {/* Dark Mode Specimen */}
      <Specimen
        title="Social"
        theme={theme}
        mode="dark"
        tokens={darkTokens}
        guidance={themeConfig.guidance}
      />

      <footer className="mt-12 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Engagement-Focused Design</h3>
        <p className="text-sm text-muted-foreground">
          Social themes emphasize user interaction with prominent avatars,
          engaging colors, and strong interactive states to encourage
          participation and content sharing.
        </p>
      </footer>
    </div>
  );
}
