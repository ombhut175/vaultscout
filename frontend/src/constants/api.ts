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
    LIST: 'users',
    GET: (id: string) => `users/${id}`,
    UPDATE: (id: string) => `users/${id}`,
    DELETE: (id: string) => `users/${id}`,
    ORGANIZATIONS: (id: string) => `users/${id}/organizations`,
    ADD_TO_ORG: (id: string) => `users/${id}/organizations`,
    REMOVE_FROM_ORG: (userId: string, orgId: string) => `users/${userId}/organizations/${orgId}`,
  },
  
  // Organization endpoints
  ORGANIZATIONS: {
    LIST: 'organizations',
    GET: (id: string) => `organizations/${id}`,
    CREATE: 'organizations',
    UPDATE: (id: string) => `organizations/${id}`,
    DELETE: (id: string) => `organizations/${id}`,
    STATS: (id: string) => `organizations/${id}/stats`,
  },
  
  // Group endpoints
  GROUPS: {
    LIST: 'groups',
    GET: (id: string) => `groups/${id}`,
    CREATE: 'groups',
    UPDATE: (id: string) => `groups/${id}`,
    DELETE: (id: string) => `groups/${id}`,
    MEMBERS: (id: string) => `groups/${id}/members`,
    ADD_MEMBER: (id: string) => `groups/${id}/members`,
    REMOVE_MEMBER: (groupId: string, userId: string) => `groups/${groupId}/members/${userId}`,
  },
  
  // Document endpoints
  DOCUMENTS: {
    LIST: 'documents',
    GET: (id: string) => `documents/${id}`,
    UPLOAD: 'documents/upload',
    UPDATE: (id: string) => `documents/${id}`,
    DELETE: (id: string) => `documents/${id}`,
    CHUNKS: (id: string) => `documents/${id}/chunks`,
    VERSIONS: (id: string) => `documents/${id}/versions`,
  },
  
  // Search endpoints
  SEARCH: {
    SEARCH: 'search',
    HISTORY: 'search/history',
    SUGGESTIONS: 'search/suggestions',
    CLEAR_HISTORY: 'search/history',
  },
} as const;

// Request Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;
