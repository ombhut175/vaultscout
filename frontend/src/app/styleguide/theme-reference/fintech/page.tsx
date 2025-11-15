import { Specimen } from "@/components/patterns/Specimen";
import { themes, getThemeTokens } from "@/lib/themes";

export default function FintechThemePage() {
  const theme = "fintech";
  const themeConfig = themes[theme];
  const lightTokens = getThemeTokens(theme, "light");
  const darkTokens = getThemeTokens(theme, "dark");

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Fintech Theme Reference
        </h1>
        <p className="text-muted-foreground text-pretty">
          {themeConfig.description}
        </p>
      </div>

      {/* Light Mode Specimen */}
      <Specimen
        title="Fintech"
        theme={theme}
        mode="light"
        tokens={lightTokens}
        guidance={themeConfig.guidance}
      />

      {/* Dark Mode Specimen */}
      <Specimen
        title="Fintech"
        theme={theme}
        mode="dark"
        tokens={darkTokens}
        guidance={themeConfig.guidance}
      />

      <footer className="mt-12 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Adding a New Theme</h3>
        <p className="text-sm text-muted-foreground">
          To add a new theme: 1) Add theme classes in{" "}
          <code>styles/tokens.css</code> for light + dark modes, 2) Add mapping
          in <code>lib/themes.ts</code>, 3) Create{" "}
          <code>app/styleguide/theme-reference/[theme]/page.tsx</code>
          with <code>&lt;Specimen&gt;</code> components for light and dark
          modes.
        </p>
      </footer>
    </div>
  );
}
