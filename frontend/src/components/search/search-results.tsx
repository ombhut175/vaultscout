'use client';

import { SearchResultCard } from './search-result-card';
import { SkeletonSearchResult } from '@/components/ui/skeleton-loader';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import { FileSearch } from 'lucide-react';

export interface SearchResultsProps {
  /**
   * Additional className for container
   */
  className?: string;
}

/**
 * SearchResults component to display search results
 * 
 * Features:
 * - Display results in list layout
 * - Show total results count
 * - Show search latency
 * - Loading skeleton
 * - Empty state for no results
 * - Uses useSearch hook
 * 
 * @example
 * ```tsx
 * <SearchResults />
 * ```
 */
export function SearchResults({ className }: SearchResultsProps) {
  const { results, isSearching, latencyMs } = useSearch();

  // Loading state
  if (isSearching) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonSearchResult key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!results || results.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <FileSearch className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Try adjusting your search query or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  // Results
  return (
    <div className={cn('space-y-4', className)}>
      {/* Results header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </h3>
        {latencyMs > 0 && (
          <span className="text-sm text-muted-foreground">
            {latencyMs}ms
          </span>
        )}
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {results.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
