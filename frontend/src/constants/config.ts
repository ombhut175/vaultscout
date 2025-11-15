// Application configuration and settings

// App Configuration
export const APP_CONFIG = {
  NAME: 'Hackathon Demo',
  VERSION: '1.0.0',
  DESCRIPTION: 'Hackathon project with Next.js + NestJS',
  
  // API Configuration
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // UI Configuration
  SKELETON_COUNT: 4,
  MAX_CONSOLE_LOG_LENGTH: 200,
  
  // Refresh intervals (in ms)
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  HEALTH_CHECK_INTERVAL: 60000, // 1 minute
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isClient: typeof window !== 'undefined',
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  STORAGE_KEY: 'hackathon-theme',
} as const;

// Debug Configuration
export const DEBUG_CONFIG = {
  ENABLE_CONSOLE_LOGS: ENV_CONFIG.isDevelopment,
  ENABLE_DEBUG_PANEL: ENV_CONFIG.isDevelopment,
  ENABLE_STORE_LOGS: ENV_CONFIG.isDevelopment,
  LOG_API_RESPONSES: ENV_CONFIG.isDevelopment,
} as const;
