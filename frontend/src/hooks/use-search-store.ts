import { create } from 'zustand';
import hackLog from '@/lib/logger';
import { SearchFilters, SearchResult } from '@/lib/api/search';

// Search Store State Interface
interface SearchState {
  // Search query
  query: string;
  
  // Search filters
  filters: SearchFilters;
  
  // Search results (cached in store for quick access)
  results: SearchResult[];
  
  // UI state
  isSearching: boolean;

  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
}

/**
 * Search Store - Client-side state management for search
 * Following hackathon rules for simple, debuggable state management
 */
export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  query: '',
  
  filters: {},
  
  results: [],
  
  isSearching: false,

  /**
   * Set search query
   */
  setQuery: (query: string) => {
    hackLog.storeAction('setQuery', {
      query,
      previousQuery: get().query,
      trigger: 'search_input'
    });

    set({ query });
  },

  /**
   * Update filters (partial update)
   */
  setFilters: (filters: Partial<SearchFilters>) => {
    hackLog.storeAction('setFilters', {
      filters,
      previousFilters: get().filters,
      trigger: 'filter_change'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        ...filters
      }
    }));
  },

  /**
   * Reset filters to default
   */
  resetFilters: () => {
    hackLog.storeAction('resetFilters', {
      previousFilters: get().filters,
      trigger: 'filter_reset'
    });

    set({
      filters: {}
    });
  },

  /**
   * Set search results
   */
  setResults: (results: SearchResult[]) => {
    hackLog.storeAction('setResults', {
      resultCount: results.length,
      trigger: 'search_complete'
    });

    set({ results });
  },

  /**
   * Set searching state
   */
  setIsSearching: (isSearching: boolean) => {
    hackLog.storeAction('setIsSearching', {
      isSearching,
      trigger: 'search_state_change'
    });

    set({ isSearching });
  },

  /**
   * Clear search (reset query, filters, and results)
   */
  clearSearch: () => {
    hackLog.storeAction('clearSearch', {
      trigger: 'search_clear'
    });

    set({
      query: '',
      filters: {},
      results: []
    });
  }
}));

// Export selector hooks for easy access to specific store parts
export const useSearchQuery = () => useSearchStore(state => state.query);
export const useSearchFilters = () => useSearchStore(state => state.filters);
export const useSearchResults = () => useSearchStore(state => state.results);
export const useIsSearching = () => useSearchStore(state => state.isSearching);
