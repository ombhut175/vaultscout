import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import hackLog from '@/lib/logger';

interface UsePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  persistInUrl?: boolean;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  resetPagination: () => void;
  getPaginationParams: () => { page: number; limit: number };
}

/**
 * Custom hook for managing pagination state
 * Optionally persists state in URL query parameters
 * 
 * @param options - Configuration options
 * @returns Pagination state and controls
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    persistInUrl = false
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL if persisting
  const initialPage = persistInUrl 
    ? parseInt(searchParams.get('page') || String(defaultPage)) 
    : defaultPage;
  const initialLimit = persistInUrl 
    ? parseInt(searchParams.get('limit') || String(defaultLimit)) 
    : defaultLimit;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  // Update URL when pagination changes
  const updateUrl = useCallback((newPage: number, newLimit: number) => {
    if (!persistInUrl) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    params.set('limit', String(newLimit));
    
    router.push(`?${params.toString()}`, { scroll: false });
    
    hackLog.dev('usePagination: URL updated', {
      page: newPage,
      limit: newLimit,
      url: `?${params.toString()}`
    });
  }, [persistInUrl, searchParams, router]);

  // Set page with URL update
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
    updateUrl(newPage, limit);
    
    hackLog.storeAction('paginationPageChange', {
      oldPage: page,
      newPage,
      limit
    });
  }, [page, limit, updateUrl]);

  // Set limit with URL update and reset to page 1
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1); // Reset to first page when changing limit
    updateUrl(1, newLimit);
    
    hackLog.storeAction('paginationLimitChange', {
      oldLimit: limit,
      newLimit,
      resetToPage: 1
    });
  }, [limit, updateUrl]);

  // Navigate to next page
  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

  // Navigate to previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  // Go to specific page
  const goToPage = useCallback((targetPage: number) => {
    if (targetPage >= 1) {
      setPage(targetPage);
    }
  }, [setPage]);

  // Reset pagination to defaults
  const resetPagination = useCallback(() => {
    setPageState(defaultPage);
    setLimitState(defaultLimit);
    updateUrl(defaultPage, defaultLimit);
    
    hackLog.storeAction('paginationReset', {
      page: defaultPage,
      limit: defaultLimit
    });
  }, [defaultPage, defaultLimit, updateUrl]);

  // Get pagination params for API calls
  const getPaginationParams = useCallback(() => {
    return { page, limit };
  }, [page, limit]);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    resetPagination,
    getPaginationParams
  };
}

/**
 * Calculate pagination metadata
 */
export function usePaginationMeta(total: number, page: number, limit: number) {
  return useMemo(() => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, total);

    return {
      totalPages,
      hasNextPage,
      hasPrevPage,
      startIndex,
      endIndex,
      isFirstPage: page === 1,
      isLastPage: page === totalPages
    };
  }, [total, page, limit]);
}

/**
 * Common page size options
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
