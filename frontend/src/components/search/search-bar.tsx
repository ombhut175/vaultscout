'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/hooks/use-search-store';
import hackLog from '@/lib/logger';

export interface SearchBarProps {
  /**
   * Placeholder text for search input
   */
  placeholder?: string;
  /**
   * Show search button
   * @default true
   */
  showSearchButton?: boolean;
  /**
   * Callback fired when search is triggered
   */
  onSearch?: (query: string) => void;
  /**
   * Additional className for container
   */
  className?: string;
}

/**
 * SearchBar component for semantic search
 * 
 * Features:
 * - Debounced search input (300ms)
 * - Search button
 * - Clear button
 * - Enter key to search
 * - Updates search store
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="Search documents..."
 *   onSearch={(query) => console.log('Searching:', query)}
 * />
 * ```
 */
export function SearchBar({
  placeholder = 'Search documents...',
  showSearchButton = true,
  onSearch,
  className
}: SearchBarProps) {
  const { query, setQuery, isSearching } = useSearchStore();
  const [localQuery, setLocalQuery] = React.useState(query);

  // Sync local query with store query
  React.useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleDebouncedChange = (value: string) => {
    hackLog.dev('SearchBar: Debounced change', { value });
    setQuery(value);
  };

  const handleSearch = () => {
    hackLog.dev('SearchBar: Search triggered', { query: localQuery });
    setQuery(localQuery);
    if (onSearch) {
      onSearch(localQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    hackLog.dev('SearchBar: Cleared');
    setLocalQuery('');
    setQuery('');
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onDebouncedChange={handleDebouncedChange}
            onKeyDown={handleKeyDown}
            onClear={handleClear}
            placeholder={placeholder}
            debounceDelay={300}
            showClearButton={true}
            disabled={isSearching}
          />
        </div>
        {showSearchButton && (
          <Button
            onClick={handleSearch}
            disabled={isSearching || !localQuery.trim()}
            className="px-6"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}
      </div>
    </div>
  );
}
