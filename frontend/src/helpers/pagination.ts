// Pagination utilities and edge case handling
import hackLog from '@/lib/logger';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Calculate total pages
export function calculateTotalPages(total: number, limit: number): number {
  if (limit <= 0) {
    hackLog.warn('Invalid pagination limit', { limit });
    return 0;
  }
  return Math.ceil(total / limit);
}

// Validate and normalize page number
export function normalizePage(page: number, totalPages: number): number {
  // Handle invalid page numbers
  if (isNaN(page) || page < 1) {
    hackLog.warn('Invalid page number, defaulting to 1', { page });
    return 1;
  }

  // Handle page beyond total pages
  if (totalPages > 0 && page > totalPages) {
    hackLog.warn('Page exceeds total pages, using last page', { page, totalPages });
    return totalPages;
  }

  return page;
}

// Validate and normalize limit
export function normalizeLimit(limit: number, defaultLimit: number = 20): number {
  const validLimits = [10, 20, 50, 100];

  if (isNaN(limit) || limit < 1) {
    hackLog.warn('Invalid limit, using default', { limit, defaultLimit });
    return defaultLimit;
  }

  // Use closest valid limit
  if (!validLimits.includes(limit)) {
    const closest = validLimits.reduce((prev, curr) =>
      Math.abs(curr - limit) < Math.abs(prev - limit) ? curr : prev
    );
    hackLog.warn('Invalid limit, using closest valid limit', { limit, closest });
    return closest;
  }

  return limit;
}

// Calculate offset for database queries
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// Check if there's a next page
export function hasNextPage(page: number, totalPages: number): boolean {
  return page < totalPages;
}

// Check if there's a previous page
export function hasPreviousPage(page: number): boolean {
  return page > 1;
}

// Get page range for pagination UI
export function getPageRange(currentPage: number, totalPages: number, maxPages: number = 5): number[] {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfMax = Math.floor(maxPages / 2);
  let start = Math.max(1, currentPage - halfMax);
  let end = Math.min(totalPages, start + maxPages - 1);

  // Adjust start if we're near the end
  if (end === totalPages) {
    start = Math.max(1, end - maxPages + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Handle empty results
export function handleEmptyResults<T>(
  data: T[] | null | undefined,
  page: number,
  totalPages: number
): { isEmpty: boolean; shouldResetPage: boolean } {
  const isEmpty = !data || data.length === 0;

  // If we're on a page beyond 1 and have no results, we should go back to page 1
  const shouldResetPage = isEmpty && page > 1 && totalPages === 0;

  if (shouldResetPage) {
    hackLog.warn('Empty results on page > 1, should reset to page 1', { page, totalPages });
  }

  return { isEmpty, shouldResetPage };
}

// Create pagination info object
export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = calculateTotalPages(total, limit);
  const normalizedPage = normalizePage(page, totalPages);

  return {
    page: normalizedPage,
    limit,
    total,
    totalPages,
  };
}

// Parse pagination from URL query params
export function parsePaginationFromQuery(
  searchParams: URLSearchParams,
  defaultLimit: number = 20
): { page: number; limit: number } {
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = limitParam ? parseInt(limitParam, 10) : defaultLimit;

  return {
    page: normalizePage(page, Infinity),
    limit: normalizeLimit(limit, defaultLimit),
  };
}

// Update URL with pagination params
export function updatePaginationInURL(page: number, limit: number): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  window.history.replaceState({}, '', url.toString());
}
