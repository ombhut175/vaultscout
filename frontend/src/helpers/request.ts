import { toast } from 'sonner';
import { HTTP_STATUS, API_MESSAGES } from '@/constants/string-const';
import { apiClient } from '@/lib/api/apiClient';
import { extractErrorMessage } from '@/helpers/errors';
import hackLog from '@/lib/logger';

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: any) => {
    // Allow callers to suppress global toast notifications (e.g., silent health checks)
    if (error.config?.suppressToast) {
      return Promise.reject(error)
    }

    // Handle network/no-response errors
    if (!error.response) {
      toast.error(API_MESSAGES.NETWORK_ERROR)
      return Promise.reject(error)
    }

    // Prefer backend-provided message when available
    const backendMessage = extractErrorMessage(error)
    if (backendMessage) {
      toast.error(backendMessage)
    } else {
      const status = error.response.status
      if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        toast.error(API_MESSAGES.SERVER_ERROR)
      }
    }

    return Promise.reject(error)
  }
);

// Generic response handler
const handleResponse = <T>(response: any, showSuccessToast = true): T => {
  const { status, data, config } = response;

  hackLog.apiSuccess(config.method?.toUpperCase() || 'UNKNOWN', config.url, {
    status,
    dataSize: JSON.stringify(data).length,
    dataPreview: JSON.stringify(data).substring(0, 200) + (JSON.stringify(data).length > 200 ? '...' : '')
  });

  // Check if response status is successful
  if (status < HTTP_STATUS.OK || status >= 300) {
    hackLog.apiError(config.method?.toUpperCase() || 'UNKNOWN', config.url, {
      status,
      data
    });
    throw new Error(`Request failed with status ${status}`);
  }

  // Show success message if it's not a GET request and has a message
  if (showSuccessToast && response.config.method !== 'get') {
    const responseData = data as any;
    if (responseData?.message) {
      toast.success(responseData.message);
    }
  }

  // Extract the nested data property from the backend response structure
  // Backend returns: {statusCode, success, message, data: actualData}
  // We need to return just the actualData
  if (data && typeof data === 'object') {
    hackLog.dataProcess('API response structure analysis', undefined, undefined);
    
    if ('data' in data) {
      if (data.data && typeof data.data === 'object' && 'programs' in data.data && 'total' in data.data) {
        hackLog.dataProcess('Paginated programs found', data.data.total, data.data.programs.length);
      }

      hackLog.dataProcess('Extracted data from API response', undefined, Array.isArray(data.data) ? data.data.length : 1);
      return data.data;
    }
  }

  // Fallback: return the data as-is if it doesn't have the expected structure
  hackLog.warn('API response structure unexpected, returning raw data', { dataType: typeof data, isArray: Array.isArray(data) });
  return data;
};

// Generic request methods
export const apiRequest = {
  // GET request
  get: async <T>(url: string, showSuccessToast = false): Promise<T> => {
    hackLog.apiRequest('GET', url);
    const response = await apiClient.get<T>(url);
    return handleResponse(response, showSuccessToast);
  },

  // POST request
  post: async <T, D = any>(url: string, data?: D, showSuccessToast = true): Promise<T> => {
    hackLog.apiRequest('POST', url, data);
    const response = await apiClient.post<T>(url, data);
    return handleResponse(response, showSuccessToast);
  },

  // PUT request
  put: async <T, D = any>(url: string, data?: D, showSuccessToast = true): Promise<T> => {
    hackLog.apiRequest('PUT', url, data);
    const response = await apiClient.put<T>(url, data);
    return handleResponse(response, showSuccessToast);
  },

  // PATCH request
  patch: async <T, D = any>(url: string, data?: D, showSuccessToast = true): Promise<T> => {
    hackLog.apiRequest('PATCH', url, data);
    const response = await apiClient.patch<T>(url, data);
    return handleResponse(response, showSuccessToast);
  },

  // DELETE request
  delete: async <T>(url: string, showSuccessToast = true): Promise<T> => {
    hackLog.apiRequest('DELETE', url);
    const response = await apiClient.delete<T>(url);
    return handleResponse(response, showSuccessToast);
  },
};

// Raw response accessors for cases where envelope metadata is needed (e.g., paginated responses)
export const apiRequestRaw = {
  get: async <T>(url: string, params?: Record<string, any>): Promise<T> => {
    const response = await apiClient.get<T>(url, { params })
    return response.data as unknown as T
  },
}


// Export axios instance for custom usage if needed
export { apiClient };

// 🚨 SWR FETCHER - USE THIS WITH INDIVIDUAL SWR HOOKS
export const swrFetcher = async (url: string) => {
  hackLog.dev('SWR Fetcher called', { url });
  return apiRequest.get(url, false); // Don't show success toast for GET requests
};

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}