'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useUsersStore } from '@/hooks/use-users-store';
import { useDebounce } from '@/hooks/useDebounce';
import hackLog from '@/lib/logger';

export function UserFilters() {
  const { filters, setSearchTerm, resetFilters } = useUsersStore();
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);
  
  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Update store when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm !== filters.searchTerm) {
      hackLog.dev('UserFilters: Debounced search term changed', {
        searchTerm: debouncedSearchTerm,
      });
      setSearchTerm(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters.searchTerm, setSearchTerm]);

  const handleClearFilters = () => {
    hackLog.dev('UserFilters: Clear filters clicked');
    setLocalSearchTerm('');
    resetFilters();
  };

  const hasActiveFilters = filters.searchTerm || filters.orgId;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by email..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
