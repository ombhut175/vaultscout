'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { SelectFilter } from '@/components/ui/select-filter';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useSearchStore } from '@/hooks/use-search-store';
import hackLog from '@/lib/logger';
import { cn } from '@/lib/utils';

export interface SearchFiltersProps {
  /**
   * Additional className for container
   */
  className?: string;
}

// File type options
const FILE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word' },
  { value: 'txt', label: 'Text' },
  { value: 'md', label: 'Markdown' },
];

// Common tags (can be extended based on your system)
const TAG_OPTIONS = [
  { value: 'important', label: 'Important' },
  { value: 'draft', label: 'Draft' },
  { value: 'final', label: 'Final' },
  { value: 'review', label: 'Review' },
  { value: 'archived', label: 'Archived' },
];

/**
 * SearchFilters component for filtering search results
 * 
 * Features:
 * - File type filter dropdown
 * - Tags filter (multi-select)
 * - TopK slider (5-50 results)
 * - Clear filters button
 * - Updates search store
 * 
 * @example
 * ```tsx
 * <SearchFilters />
 * ```
 */
export function SearchFilters({ className }: SearchFiltersProps) {
  const { filters, setFilters, resetFilters } = useSearchStore();
  const [topK, setTopK] = React.useState(10);

  const handleFileTypeChange = (value: string) => {
    hackLog.dev('SearchFilters: File type changed', { value });
    const newFileType = value === 'all' ? undefined : value;
    if (newFileType !== filters.fileType) {
      if (value === 'all') {
        const { fileType, ...rest } = filters;
        setFilters(rest);
      } else {
        setFilters({ fileType: value });
      }
    }
  };

  const handleTagsChange = (value: string) => {
    hackLog.dev('SearchFilters: Tag toggled', { value });
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(value)
      ? currentTags.filter(t => t !== value)
      : [...currentTags, value];
    
    if (newTags.length === 0) {
      const { tags, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ tags: newTags });
    }
  };

  const handleTopKChange = (value: number[]) => {
    const newTopK = value[0];
    hackLog.dev('SearchFilters: TopK changed', { value: newTopK });
    setTopK(newTopK);
  };

  const handleClearFilters = () => {
    hackLog.dev('SearchFilters: Cleared all filters');
    resetFilters();
    setTopK(10);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || topK !== 10;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* File Type Filter */}
      <SelectFilter
        label="File Type"
        placeholder="Select file type"
        options={FILE_TYPE_OPTIONS}
        value={filters.fileType || 'all'}
        onValueChange={handleFileTypeChange}
        size="sm"
      />

      {/* Tags Filter (Multi-select) */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => {
            const isSelected = filters.tags?.includes(tag.value);
            return (
              <Button
                key={tag.value}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTagsChange(tag.value)}
                className="h-7 text-xs"
              >
                {tag.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* TopK Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Results</Label>
          <span className="text-xs text-muted-foreground">{topK}</span>
        </div>
        <Slider
          value={[topK]}
          onValueChange={handleTopKChange}
          min={5}
          max={50}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5</span>
          <span>50</span>
        </div>
      </div>
    </div>
  );
}
