import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_URL_PREFIX } from "@/constants/string-const";
import hackLog from "@/lib/logger";

/**
 * Get API URL from environment variables
 * NEXT_PUBLIC_ variables are automatically inlined at build time by Next.js
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window === 'undefined') {
  // Only warn on server-side during development
  console.warn(
    '⚠️  NEXT_PUBLIC_API_URL is not set. Please add it to your .env.local file.\n' +
    'Example: NEXT_PUBLIC_API_URL=http://localhost:6523'
  );
}

/**
 * Create the base URL for API requests
 * Combines the API URL with the API prefix
 */
function createBaseURL(): string {
  if (!API_URL) {
    throw new Error(
      'NEXT_PUBLIC_API_URL environment variable is required.\n' +
      'Please create a .env.local file with: NEXT_PUBLIC_API_URL=http://localhost:6523'
    );
  }
  
  const base = API_URL.replace(/\/+$/g, '');
  const prefix = API_URL_PREFIX.replace(/^\/+|\/+$/g, '');
  const fullUrl = base ? `${base}/${prefix}` : `/${prefix}`;
  
  hackLog.info('API Client initialized', { baseURL: fullUrl });
  return fullUrl;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]; // Retry on these status codes

// Track retry count for each request
interface RetryConfig extends AxiosRequestConfig {
  __retryCount?: number;
}

// Helper to check if error is retryable
function isRetryableError(error: AxiosError): boolean {
  // Network errors (no response)
  if (!error.response) {
    return true;
  }
  
  // Specific status codes
  if (error.response.status && RETRY_STATUS_CODES.includes(error.response.status)) {
    return true;
  }
  
  return false;
}

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create the axios instance 
export const apiClient = axios.create({
  baseURL: createBaseURL(),
  withCredentials: true,
  timeout: 30000, // 30 second timeout (increased for document uploads)
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    config.headers = config.headers || {};
    
    // Normalize URL to respect baseURL: remove leading slash for relative API paths
    if (config.url && typeof config.url === 'string') {
      const urlString = config.url as string;
      const isAbsolute = /^https?:\/\//i.test(urlString);
      if (!isAbsolute && urlString.startsWith('/')) {
        config.url = urlString.replace(/^\/+/, '');
      }
    }
    
    // Let axios set the Content-Type header automatically for FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and retry logic
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;
    
    // Log error details
    if (error.response) {
      console.error("API Error Response:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API Error No Response:", error.message);
    } else {
      console.error("API Error Setup:", error.message);
    }
    
    // Check if we should retry
    if (config && isRetryableError(error)) {
      config.__retryCount = config.__retryCount || 0;
      
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        
        const retryDelay = RETRY_DELAY * config.__retryCount; // Exponential backoff
        
        hackLog.warn(`Retrying request (attempt ${config.__retryCount}/${MAX_RETRIES})`, {
          url: config.url,
          method: config.method,
          delay: retryDelay,
          error: error.message
        });
        
        // Wait before retrying
        await delay(retryDelay);
        
        // Retry the request
        return apiClient(config);
      } else {
        hackLog.error('Max retries reached', {
          url: config.url,
          method: config.method,
          retries: config.__retryCount
        });
      }
    }
    
    return Promise.reject(error);
  }
);