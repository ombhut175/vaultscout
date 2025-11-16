'use client';

import * as React from 'react';
import { SearchBar } from '@/components/search/search-bar';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchResults } from '@/components/search/search-results';
import { SearchHistory } from '@/components/search/search-history';
import { Card, CardContent } from '@/components/ui/card';
import hackLog from '@/lib/logger';

/**
 * Search Page
 * 
 * Features:
 * - Search bar with debouncing
 * - Search filters (file type, tags, topK)
 * - Search results with relevance scores
 * - Search history sidebar
 * - Loading and error states
 * - Links to document detail pages
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function SearchPage() {
  React.useEffect(() => {
    hackLog.dev('SearchPage: Mounted');
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Documents</h1>
        <p className="text-muted-foreground">
          Search across all your accessible documents using semantic search
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search for documents, topics, or keywords..."
          showSearchButton={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <SearchFilters />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content - Results */}
        <main className="lg:col-span-2">
          <SearchResults />
        </main>

        {/* Right Sidebar - History */}
        <aside className="lg:col-span-1">
          <SearchHistory maxItems={10} />
        </aside>
      </div>
    </div>
  );
}
