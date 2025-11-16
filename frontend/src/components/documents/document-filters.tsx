'use client';

import * as React from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDocsStore } from '@/hooks/use-docs-store';
import hackLog from '@/lib/logger';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
];

const FILE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word' },
  { value: 'txt', label: 'Text' },
  { value: 'md', label: 'Markdown' },
];

export function DocumentFilters() {
  const { filters, setSearchTerm, setStatus, setFileType, resetFilters } = useDocsStore();

  const handleSearchChange = React.useCallback((value: string) => {
    hackLog.dev('DocumentFilters: Search changed', { value });
    setSearchTerm(value);
  }, [setSearchTerm]);

  const handleStatusChange = (value: string) => {
    hackLog.dev('DocumentFilters: Status changed', { value });
    const newStatus = value === 'all' ? null : value;
    if (newStatus !== filters.status) {
      setStatus(newStatus);
    }
  };

  const handleFileTypeChange = (value: string) => {
    hackLog.dev('DocumentFilters: File type changed', { value });
    const newFileType = value === 'all' ? null : value;
    if (newFileType !== filters.fileType) {
      setFileType(newFileType);
    }
  };

  const handleClearFilters = () => {
    hackLog.dev('DocumentFilters: Clearing all filters');
    resetFilters();
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.status ||
    filters.fileType ||
    filters.tags.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Search input */}
        <div className="flex-1">
          <SearchInput
            placeholder="Search documents..."
            value={filters.searchTerm}
            onDebouncedChange={handleSearchChange}
            onClear={() => setSearchTerm('')}
          />
        </div>

        {/* Status filter */}
        <div className="w-full md:w-48">
          <SelectFilter
            label="Status"
            placeholder="Select status"
            options={STATUS_OPTIONS}
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          />
        </div>

        {/* File type filter */}
        <div className="w-full md:w-48">
          <SelectFilter
            label="File Type"
            placeholder="Select type"
            options={FILE_TYPE_OPTIONS}
            value={filters.fileType || 'all'}
            onValueChange={handleFileTypeChange}
          />
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={handleClearFilters}
            className="w-full md:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {filters.searchTerm && (
            <span className="font-medium">Search: "{filters.searchTerm}"</span>
          )}
          {filters.status && (
            <span className="font-medium">Status: {filters.status}</span>
          )}
          {filters.fileType && (
            <span className="font-medium">Type: {filters.fileType}</span>
          )}
          {filters.tags.length > 0 && (
            <span className="font-medium">Tags: {filters.tags.join(', ')}</span>
          )}
        </div>
      )}
    </div>
  );
}
