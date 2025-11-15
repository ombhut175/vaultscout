// Environment loader using @next/env for reliable variable loading
// This addresses the Next.js 15 + Turbopack environment variable injection issue

import { loadEnvConfig } from '@next/env';

// Load environment variables from .env files
const projectDir = process.cwd();
loadEnvConfig(projectDir);

/**
 * Validate required environment variables (only warn, don't throw)
 */
if (!process.env.NEXT_PUBLIC_API_URL && typeof window === 'undefined') {
  console.warn(
    '⚠️  NEXT_PUBLIC_API_URL is not set in environment variables.\n' +
    'Please create a .env.local file and add: NEXT_PUBLIC_API_URL=http://localhost:6932\n' +
    'See .env.example for reference.'
  );
}

// Define the environment configuration
const ENV_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
} as const;

export const ENV = ENV_CONFIG;

export function getEnv() {
  return ENV_CONFIG;
}

export function getApiBaseURL(prefix: string): string {
  const base = ENV.apiBaseUrl.replace(/\/+$/g, '');
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '');
  return base ? `${base}/${cleanPrefix}` : `/${cleanPrefix}`;
}
