// Search utilities and edge case handling
import hackLog from '@/lib/logger';

// Normalize search query
export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

// Check if search query is valid
export function isValidSearchQuery(query: string, minLength: number = 2): boolean {
  const normalized = normalizeSearchQuery(query);
  
  if (normalized.length < minLength) {
    hackLog.dev('Search query too short', { query, minLength });
    return false;
  }
  
  return true;
}

// Highlight search terms in text
export function highlightSearchTerms(text: string, searchTerms: string[]): string {
  if (!searchTerms || searchTerms.length === 0) {
    return text;
  }

  let highlightedText = text;
  
  searchTerms.forEach((term) => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });

  return highlightedText;
}

// Extract search terms from query
export function extractSearchTerms(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  
  // Split by spaces and filter out empty strings
  return normalized.split(/\s+/).filter((term) => term.length > 0);
}

// Check if results are empty
export function hasSearchResults<T>(results: T[] | null | undefined): boolean {
  return results !== null && results !== undefined && results.length > 0;
}

// Get search suggestions based on query
export function getSearchSuggestions(
  query: string,
  history: string[],
  maxSuggestions: number = 5
): string[] {
  if (!query || query.trim().length === 0) {
    return history.slice(0, maxSuggestions);
  }

  const normalized = normalizeSearchQuery(query);
  
  // Filter history items that start with or contain the query
  const suggestions = history.filter((item) =>
    normalizeSearchQuery(item).includes(normalized)
  );

  return suggestions.slice(0, maxSuggestions);
}

// Format search result snippet
export function formatSearchSnippet(
  text: string,
  query: string,
  maxLength: number = 200
): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const normalized = normalizeSearchQuery(query);
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(normalized);

  if (index === -1) {
    // Query not found, return start of text
    return text.substring(0, maxLength) + '...';
  }

  // Calculate snippet boundaries
  const halfLength = Math.floor(maxLength / 2);
  let start = Math.max(0, index - halfLength);
  let end = Math.min(text.length, index + normalized.length + halfLength);

  // Adjust to word boundaries
  if (start > 0) {
    const spaceIndex = text.lastIndexOf(' ', start);
    if (spaceIndex > 0) {
      start = spaceIndex + 1;
    }
  }

  if (end < text.length) {
    const spaceIndex = text.indexOf(' ', end);
    if (spaceIndex > 0) {
      end = spaceIndex;
    }
  }

  let snippet = text.substring(start, end);

  if (start > 0) {
    snippet = '...' + snippet;
  }

  if (end < text.length) {
    snippet = snippet + '...';
  }

  return snippet;
}

// Debounce search input
export function debounceSearch<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// Handle search error
export function handleSearchError(error: unknown): string {
  hackLog.error('Search error', { error });

  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return 'Search timed out. Please try again.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    return error.message;
  }

  return 'An error occurred while searching. Please try again.';
}

// Validate search filters
export interface SearchFilters {
  fileType?: string[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export function validateSearchFilters(filters: SearchFilters): boolean {
  // Check date range validity
  if (filters.dateFrom && filters.dateTo) {
    if (filters.dateFrom > filters.dateTo) {
      hackLog.warn('Invalid date range in search filters', {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
      return false;
    }
  }

  return true;
}
