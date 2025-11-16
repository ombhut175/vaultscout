import { useState, useEffect } from 'react';
import { SearchAPI, SearchRequest, SearchResponse } from '@/lib/api/search';
import { handleError } from '@/helpers/errors';
import hackLog from '@/lib/logger';
import { useDebounce } from './useDebounce';
import { useSearchStore } from './use-search-store';

/**
 * Hook to perform semantic search with debouncing
 * Implements 300ms debouncing for search query
 */
export function useSearch() {
  const { query, filters, setResults, setIsSearching } = useSearchStore();
  const [error, setError] = useState<Error | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  // Debounce search query with 300ms delay
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // Don't search if query is empty
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      hackLog.dev('Performing search', { query: debouncedQuery, filters });
      setIsSearching(true);
      setError(null);

      try {
        const searchRequest: SearchRequest = {
          query: debouncedQuery,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          topK: 10
        };

        const response: SearchResponse = await SearchAPI.search(searchRequest);
        
        setResults(response.results);
        setLatencyMs(response.latencyMs);
        
        hackLog.dev('Search completed', { 
          resultCount: response.results.length,
          latencyMs: response.latencyMs
        });
      } catch (err) {
        const error = err as Error;
        setError(error);
        handleError(error, { toast: true });
        hackLog.error('Search failed', { error, query: debouncedQuery });
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, filters, setResults, setIsSearching]);

  return {
    isSearching: useSearchStore(state => state.isSearching),
    results: useSearchStore(state => state.results),
    error,
    latencyMs
  };
}
