import { Specimen } from "@/components/patterns/Specimen";
import { themes, getThemeTokens } from "@/lib/themes";

export default function EdtechThemePage() {
  const theme = "edtech";
  const themeConfig = themes[theme];
  const lightTokens = getThemeTokens(theme, "light");
  const darkTokens = getThemeTokens(theme, "dark");

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Education Theme Reference
        </h1>
        <p className="text-muted-foreground text-pretty">
          {themeConfig.description}
        </p>
      </div>

      {/* Light Mode Specimen */}
      <Specimen
        title="Education"
        theme={theme}
        mode="light"
        tokens={lightTokens}
        guidance={themeConfig.guidance}
      />

      {/* Dark Mode Specimen */}
      <Specimen
        title="Education"
        theme={theme}
        mode="dark"
        tokens={darkTokens}
        guidance={themeConfig.guidance}
      />

      <footer className="mt-12 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Theme Implementation Notes</h3>
        <p className="text-sm text-muted-foreground">
          Each theme uses semantic tokens that automatically adapt to light/dark
          modes. The <code>ForcedTheme</code> component ensures consistent
          display regardless of user preferences.
        </p>
      </footer>
    </div>
  );
}
