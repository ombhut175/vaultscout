import axios from "axios";
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
    'Example: NEXT_PUBLIC_API_URL=http://localhost:6932'
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
      'Please create a .env.local file with: NEXT_PUBLIC_API_URL=http://localhost:6932'
    );
  }
  
  const base = API_URL.replace(/\/+$/g, '');
  const prefix = API_URL_PREFIX.replace(/^\/+|\/+$/g, '');
  const fullUrl = base ? `${base}/${prefix}` : `/${prefix}`;
  
  hackLog.info('API Client initialized', { baseURL: fullUrl });
  return fullUrl;
}

// Create the axios instance 
export const apiClient = axios.create({
  baseURL: createBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 second timeout
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

// Add response interceptor for logging while preserving original error shape
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error: any) => {
    // Log and pass through so downstream interceptors/handlers can decide
    if (error.response) {
      console.error("API Error Response:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API Error No Response:", error.message);
    } else {
      console.error("API Error Setup:", error.message);
    }
    return Promise.reject(error);
  }
);