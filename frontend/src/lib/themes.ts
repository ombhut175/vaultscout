export interface ThemeConfig {
  name: string
  label: string
  primary: {
    light: string
    dark: string
  }
  neutral: {
    light: string
    dark: string
  }
  description: string
  guidance: string[]
}

export const themes: Record<string, ThemeConfig> = {
  fintech: {
    name: "fintech",
    label: "Fintech",
    primary: {
      light: "jade",
      dark: "jade",
    },
    neutral: {
      light: "slate",
      dark: "slate",
    },
    description: "Professional financial interfaces with crisp borders and dense data presentation",
    guidance: [
      "Use minimal border radius (0.25rem) for sharp, professional edges that convey precision",
      "Emphasize numerical data with monospace typography and clear visual hierarchy",
      "Implement dense, information-rich layouts that maximize data visibility per screen",
      "Apply jade/green for positive financial indicators, red for losses, maintaining high contrast",
      "Prioritize accessibility with WCAG AA compliance for trading environments and critical data",
      "Minimize decorative elements - every pixel should serve a functional purpose",
      "Use crisp 1px borders to create clear data separation and structured layouts",
    ],
  },
  health: {
    name: "health",
    label: "Healthcare",
    primary: {
      light: "mint",
      dark: "teal",
    },
    neutral: {
      light: "gray",
      dark: "gray",
    },
    description: "Calming healthcare interfaces with generous spacing and accessibility focus",
    guidance: [
      "Implement generous line-height (1.6+) and larger font sizes for improved medical text readability",
      "Use soft border radius (0.75rem) to create approachable, non-intimidating interface elements",
      "Apply calming mint and teal color palettes to reduce patient anxiety and stress",
      "Ensure exceptional contrast ratios (WCAG AAA when possible) for users with visual impairments",
      "Create clear visual hierarchy for critical health information using size and color weight",
      "Provide ample whitespace between sections to reduce cognitive load during stressful situations",
      "Design with empathy - consider users may be in pain, stressed, or have limited technical skills",
    ],
  },
  edtech: {
    name: "edtech",
    label: "Education",
    primary: {
      light: "violet",
      dark: "indigo",
    },
    neutral: {
      light: "slate",
      dark: "slate",
    },
    description: "Friendly educational interfaces with engaging colors and clear progression",
    guidance: [
      "Choose friendly, approachable typography that works well for diverse age groups and reading levels",
      "Use violet and indigo to create a sense of learning progression and intellectual growth",
      "Implement badge and achievement systems with playful visual rewards for motivation",
      "Provide immediate visual feedback for all interactions to support learning engagement",
      "Balance playful aesthetics with professional credibility - fun but not childish",
      "Optimize readability across all age groups with clear typography and sufficient contrast",
      "Design progress indicators that celebrate small wins and maintain learning momentum",
    ],
  },
  ecommerce: {
    name: "ecommerce",
    label: "E-commerce",
    primary: {
      light: "amber",
      dark: "blue",
    },
    neutral: {
      light: "gray",
      dark: "gray",
    },
    description: "Conversion-focused commerce interfaces with strong price emphasis",
    guidance: [
      "Create strong visual emphasis on pricing, discounts, and call-to-action buttons for conversion",
      "Use amber for urgency and scarcity messaging, blue for trust and security indicators",
      "Design product imagery to be the hero - minimize interface chrome around product photos",
      "Make add-to-cart and checkout flows prominent with high-contrast, action-oriented design",
      "Include trust signals like security badges, reviews, and guarantees in strategic locations",
      "Optimize for mobile-first shopping experiences with thumb-friendly touch targets",
      "Use promotional colors and typography that create excitement without overwhelming the product",
    ],
  },
  saas: {
    name: "saas",
    label: "SaaS",
    primary: {
      light: "blue",
      dark: "cyan",
    },
    neutral: {
      light: "slate",
      dark: "slate",
    },
    description: "Clean SaaS interfaces with minimal chrome and neutral backgrounds",
    guidance: [
      "Minimize interface chrome to maximize content area - let data and functionality take center stage",
      "Use neutral, low-saturation backgrounds to reduce eye strain during extended work sessions",
      "Apply blue and cyan strategically to build professional trust and reliability",
      "Design clean, readable data visualizations with consistent spacing and typography scales",
      "Implement consistent 8px grid system for predictable, harmonious spacing relationships",
      "Optimize dashboard layouts for information density while maintaining visual breathing room",
      "Focus on functional clarity over decorative elements - every design choice should serve productivity",
    ],
  },
  social: {
    name: "social",
    label: "Social",
    primary: {
      light: "pink",
      dark: "plum",
    },
    neutral: {
      light: "gray",
      dark: "gray",
    },
    description: "Engaging social interfaces with avatars, chips, and interactive states",
    guidance: [
      "Make avatars and profile imagery prominent throughout the interface to emphasize human connection",
      "Use interactive chips, tags, and badges to encourage engagement and content discovery",
      "Apply pink and plum colors to create warmth, friendliness, and emotional connection",
      "Design strong hover and active states that provide satisfying feedback for social interactions",
      "Implement card-based layouts that naturally frame user-generated content and conversations",
      "Prioritize user-generated content with generous image and video display areas",
      "Create playful, rounded aesthetics (1rem radius) that feel approachable and community-focused",
      "Use animation and micro-interactions to make social actions feel rewarding and engaging",
    ],
  },
}

export function getThemeTokens(themeName: string, mode: "light" | "dark") {
  const theme = themes[themeName]
  if (!theme) return {}

  const tokens: Record<string, string> = {
    "--background": mode === "light" ? "oklch(1 0 0)" : "oklch(0.145 0 0)",
    "--foreground": mode === "light" ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)",
    "--card": mode === "light" ? "oklch(1 0 0)" : "oklch(0.145 0 0)",
    "--card-foreground": mode === "light" ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)",
    "--popover": mode === "light" ? "oklch(1 0 0)" : "oklch(0.145 0 0)",
    "--popover-foreground": mode === "light" ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)",
    "--muted": mode === "light" ? "oklch(0.97 0 0)" : "oklch(0.269 0 0)",
    "--muted-foreground": mode === "light" ? "oklch(0.556 0 0)" : "oklch(0.708 0 0)",
    "--border": mode === "light" ? "oklch(0.922 0 0)" : "oklch(0.269 0 0)",
    "--input": mode === "light" ? "oklch(0.922 0 0)" : "oklch(0.269 0 0)",
    "--ring": mode === "light" ? "oklch(0.708 0 0)" : "oklch(0.439 0 0)",
    "--radius": "0.625rem",
    "--primary": "",
    "--primary-foreground": "",
    "--accent": "",
  }

  // Theme-specific primary colors
  const primaryColors = {
    jade: { light: "oklch(0.646 0.222 166.116)", dark: "oklch(0.696 0.17 162.48)" },
    mint: { light: "oklch(0.6 0.118 184.704)", dark: "oklch(0.696 0.17 184.704)" },
    violet: { light: "oklch(0.488 0.243 264.376)", dark: "oklch(0.627 0.265 303.9)" },
    amber: { light: "oklch(0.828 0.189 84.429)", dark: "oklch(0.769 0.188 70.08)" },
    blue: { light: "oklch(0.398 0.07 227.392)", dark: "oklch(0.488 0.243 264.376)" },
    pink: { light: "oklch(0.769 0.188 70.08)", dark: "oklch(0.645 0.246 16.439)" },
    teal: { light: "oklch(0.6 0.118 184.704)", dark: "oklch(0.696 0.17 184.704)" },
    indigo: { light: "oklch(0.488 0.243 264.376)", dark: "oklch(0.627 0.265 303.9)" },
    cyan: { light: "oklch(0.6 0.118 184.704)", dark: "oklch(0.696 0.17 184.704)" },
    plum: { light: "oklch(0.627 0.265 303.9)", dark: "oklch(0.645 0.246 16.439)" },
  }

  const primaryColor = theme.primary[mode] as keyof typeof primaryColors
  if (primaryColors[primaryColor]) {
    tokens["--primary"] = primaryColors[primaryColor][mode]
    tokens["--primary-foreground"] = mode === "light" ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)"
    tokens["--accent"] = primaryColors[primaryColor][mode]
  }

  return tokens
}

export function getThemeClass(themeName: string, mode: "light" | "dark") {
  return `theme-${themeName} ${mode}`
}
