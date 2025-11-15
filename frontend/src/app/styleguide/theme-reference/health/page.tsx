import { Specimen } from "@/components/patterns/Specimen";
import { themes, getThemeTokens } from "@/lib/themes";

export default function HealthThemePage() {
  const theme = "health";
  const themeConfig = themes[theme];
  const lightTokens = getThemeTokens(theme, "light");
  const darkTokens = getThemeTokens(theme, "dark");

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Healthcare Theme Reference
        </h1>
        <p className="text-muted-foreground text-pretty">
          {themeConfig.description}
        </p>
      </div>

      {/* Light Mode Specimen */}
      <Specimen
        title="Healthcare"
        theme={theme}
        mode="light"
        tokens={lightTokens}
        guidance={themeConfig.guidance}
      />

      {/* Dark Mode Specimen */}
      <Specimen
        title="Healthcare"
        theme={theme}
        mode="dark"
        tokens={darkTokens}
        guidance={themeConfig.guidance}
      />

      <footer className="mt-12 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Reusing SpecimenPage</h3>
        <p className="text-sm text-muted-foreground">
          The <code>SpecimenPage</code> component can be reused for any new
          theme routes. Simply wrap it in <code>&lt;Specimen&gt;</code>{" "}
          components with the appropriate theme and mode props.
        </p>
      </footer>
    </div>
  );
}
