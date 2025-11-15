// Application routes and navigation paths

// Main app routes
export const ROUTES = {
  // Main pages
  HOME: '/',
  DASHBOARD: '/dashboard',
  NEXLOG: '/nexlog',
  TESTING: '/testing',
  
  // Auth routes (using Next.js route groups)
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup', 
    FORGOT_PASSWORD: '/forgot-password',
  },
  
  // Style guide and docs
  STYLEGUIDE: '/styleguide',
  
  // API routes (for external linking/reference)
  API: {
    TESTING: '/api/test/testing',
    SUPABASE_STATUS: '/api/test/supabase-status',
    DATABASE_STATUS: '/api/test/database-status',
  }
} as const;

// Navigation items for main authenticated app (post-login)
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'home',
  },
  {
    title: 'Nexlog',
    href: ROUTES.NEXLOG,
    icon: 'activity',
  },
  {
    title: 'Testing Dashboard',
    href: ROUTES.TESTING,
    icon: 'beaker',
  },
  {
    title: 'Style Guide',
    href: ROUTES.STYLEGUIDE,
    icon: 'palette',
  },
] as const;

// Auth navigation items
export const AUTH_NAV_ITEMS = [
  {
    title: 'Sign In',
    href: ROUTES.AUTH.LOGIN,
  },
  {
    title: 'Sign Up', 
    href: ROUTES.AUTH.SIGNUP,
  },
  {
    title: 'Forgot Password',
    href: ROUTES.AUTH.FORGOT_PASSWORD,
  },
] as const;

// Type definitions
export type RouteValue = typeof ROUTES[keyof typeof ROUTES] | typeof ROUTES.AUTH[keyof typeof ROUTES.AUTH] | typeof ROUTES.API[keyof typeof ROUTES.API];
export type NavItem = typeof NAV_ITEMS[number];
export type AuthNavItem = typeof AUTH_NAV_ITEMS[number];
