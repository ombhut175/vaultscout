'use client';

import { Clock, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonListItem } from '@/components/ui/skeleton-loader';
import { useSearchHistory, useClearSearchHistory } from '@/hooks/useSearchHistory';
import { useSearchStore } from '@/hooks/use-search-store';
import { cn } from '@/lib/utils';
import hackLog from '@/lib/logger';
import { formatDistanceToNow } from 'date-fns';
import { useOrganizationMembership } from '@/hooks/useOrganizationMembership';

export interface SearchHistoryProps {
  /**
   * Additional className for container
   */
  className?: string;
  /**
   * Maximum number of history items to display
   * @default 10
   */
  maxItems?: number;
}

/**
 * SearchHistory component to display recent searches
 * 
 * Features:
 * - Display recent searches in list
 * - Show query text, timestamp, result count
 * - "Search Again" button for each
 * - "Clear History" button
 * - Uses useSearchHistory hook
 * - Loading states
 * 
 * @example
 * ```tsx
 * <SearchHistory maxItems={10} />
 * ```
 */
export function SearchHistory({ className, maxItems = 10 }: SearchHistoryProps) {
  const { history, isLoading } = useSearchHistory({ limit: maxItems });
  const { setQuery, setFilters } = useSearchStore();
  const { clearHistory, isClearing } = useClearSearchHistory();
  const { currentOrgId } = useOrganizationMembership();

  const handleSearchAgain = (queryText: string, filters: any) => {
    hackLog.dev('SearchHistory: Search again clicked', { queryText, filters });
    setQuery(queryText);
    if (filters && Object.keys(filters).length > 0) {
      setFilters(filters);
    }
  };

  const handleClearHistory = async () => {
    if (!currentOrgId) {
      hackLog.error('SearchHistory: No organization ID available');
      return;
    }
    
    hackLog.dev('SearchHistory: Clear history clicked', { orgId: currentOrgId });
    await clearHistory(currentOrgId);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonListItem key={i} className="p-2" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!history || history.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No search history yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Searches
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              disabled={isClearing}
              className="h-8 px-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1 mb-1">
                  {item.queryText}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                  <span>•</span>
                  <span>{item.matchIds.length} results</span>
                  {item.latencyMs && (
                    <>
                      <span>•</span>
                      <span>{item.latencyMs}ms</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchAgain(item.queryText, item.filters)}
                className="h-8 px-2 flex-shrink-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
