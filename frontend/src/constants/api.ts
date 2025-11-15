/**
 * API Configuration and Endpoints
 * NEXT_PUBLIC_API_URL must be set in .env.local file
 * Next.js will inline this at build time
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Testing API Endpoints (relative URLs - prefix handled by apiClient)
export const API_ENDPOINTS = {
  // Test endpoints
  TESTING: {
    DATA: 'test/testing', // 🚨 Relative URL - prefix added by apiClient
    SUPABASE_STATUS: 'test/supabase-status', 
    DATABASE_STATUS: 'test/database-status',
  },
  
  // Auth endpoints (from existing constants)
  AUTH: {
    LOGIN: 'auth/login',
    SIGNUP: 'auth/signup',
    LOGOUT: 'auth/logout',
    IS_LOGGED_IN: 'auth/isLoggedIn',
    FORGOT_PASSWORD: 'auth/forgot-password',
  },
  
  // User endpoints (from existing constants)
  USERS: {
    ME: 'users/me',
    ORGANIZATION_MEMBERSHIP: 'users/organization-membership',
  },
} as const;

// Request Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;
