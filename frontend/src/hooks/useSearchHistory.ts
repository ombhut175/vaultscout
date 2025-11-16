import useSWR, { mutate } from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { SearchHistoryResponse, SearchSuggestion, SearchAPI } from '@/lib/api/search';
import { useState } from 'react';
import { toast } from 'sonner';

interface UseSearchHistoryOptions {
  page?: number;
  limit?: number;
}

/**
 * Hook to fetch user's search history
 * Uses SWR for caching and automatic revalidation
 */
export function useSearchHistory(options: UseSearchHistoryOptions = {}) {
  const { page = 1, limit = 20 } = options;

  // Build query params
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());

  const url = `${API_ENDPOINTS.SEARCH.HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  hackLog.dev('useSearchHistory hook called', { page, limit, url });

  const { data, error, isLoading, mutate } = useSWR<SearchHistoryResponse>(
    url,
    (url: string) => swrFetcher<SearchHistoryResponse>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    history: data?.history || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

/**
 * Hook to fetch search suggestions based on history
 * Uses SWR for caching and automatic revalidation
 */
export function useSearchSuggestions() {
  const url = API_ENDPOINTS.SEARCH.SUGGESTIONS;

  hackLog.dev('useSearchSuggestions hook called', { url });

  const { data, error, isLoading, mutate } = useSWR<SearchSuggestion[]>(
    url,
    (url: string) => swrFetcher<SearchSuggestion[]>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Cache suggestions for 5 seconds
    }
  );

  return {
    suggestions: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

/**
 * Hook to clear search history
 * Provides mutation function with loading state
 */
export function useClearSearchHistory() {
  const [isClearing, setIsClearing] = useState(false);

  const clearHistory = async (orgId: string) => {
    setIsClearing(true);
    hackLog.dev('Clearing search history', { orgId });

    try {
      const result = await SearchAPI.clearHistory(orgId);
      
      hackLog.dev('Search history cleared successfully', { 
        deletedCount: result.deletedCount,
        orgId 
      });

      // Revalidate search history and suggestions
      await mutate(
        (key) => typeof key === 'string' && key.includes(API_ENDPOINTS.SEARCH.HISTORY),
        undefined,
        { revalidate: true }
      );
      await mutate(API_ENDPOINTS.SEARCH.SUGGESTIONS, undefined, { revalidate: true });

      toast.success(result.message || 'Search history cleared successfully');
      
      return result;
    } catch (error) {
      hackLog.error('Failed to clear search history', { error, orgId });
      toast.error(error instanceof Error ? error.message : 'Failed to clear search history');
      throw error;
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearHistory,
    isClearing
  };
}
