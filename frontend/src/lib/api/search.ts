import { apiRequest } from '@/helpers/request';
import hackLog from '@/lib/logger';
import { API_ENDPOINTS } from '@/constants/api';
import { extractErrorMessage } from '@/helpers/errors';

// Search API Types
export interface SearchFilters {
  fileType?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  topK?: number;
  orgId?: string;
}

export interface SearchResult {
  id: string;
  documentId: string;
  documentTitle: string;
  text: string;
  score: number;
  page?: number;
  sectionTitle?: string;
  fileType: string;
  tags: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  latencyMs: number;
}

export interface SearchHistoryItem {
  id: string;
  queryText: string;
  filters: SearchFilters;
  topk: number;
  latencyMs: number;
  matchIds: string[];
  createdAt: string;
}

export interface SearchHistoryResponse {
  history: SearchHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchSuggestion {
  query: string;
  count: number;
  lastUsed: string;
}

// Search API Service
export class SearchAPI {
  /**
   * Perform semantic search
   */
  static async search(data: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await apiRequest.post<SearchResponse>(API_ENDPOINTS.SEARCH.SEARCH, data, false);
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.SEARCH.SEARCH, {
        query: data.query,
        resultCount: response.results.length,
        latencyMs: response.latencyMs,
        component: 'SearchAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.SEARCH.SEARCH, {
        error,
        query: data.query,
        component: 'SearchAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Search failed');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get search history
   */
  static async getHistory(params?: { page?: number; limit?: number }): Promise<SearchHistoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_ENDPOINTS.SEARCH.HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest.get<SearchHistoryResponse>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        historyCount: response.history.length,
        total: response.total,
        component: 'SearchAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.SEARCH.HISTORY, {
        error,
        params,
        component: 'SearchAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch search history');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get search suggestions based on history
   */
  static async getSuggestions(): Promise<SearchSuggestion[]> {
    try {
      const response = await apiRequest.get<SearchSuggestion[]>(API_ENDPOINTS.SEARCH.SUGGESTIONS, false);
      
      hackLog.apiSuccess('GET', API_ENDPOINTS.SEARCH.SUGGESTIONS, {
        suggestionCount: response.length,
        component: 'SearchAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.SEARCH.SUGGESTIONS, {
        error,
        component: 'SearchAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch search suggestions');
      throw new Error(errorMessage);
    }
  }

  /**
   * Clear search history for the current user
   */
  static async clearHistory(orgId: string): Promise<{ deletedCount: number; message: string }> {
    try {
      const url = `${API_ENDPOINTS.SEARCH.CLEAR_HISTORY}?orgId=${orgId}`;
      const response = await apiRequest.delete<{ deletedCount: number; message: string }>(url, false);
      
      hackLog.apiSuccess('DELETE', url, {
        deletedCount: response.deletedCount,
        component: 'SearchAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('DELETE', API_ENDPOINTS.SEARCH.CLEAR_HISTORY, {
        error,
        orgId,
        component: 'SearchAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to clear search history');
      throw new Error(errorMessage);
    }
  }
}
