'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from './input';
import hackLog from '@/lib/logger';

export interface SearchInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  /**
   * Callback fired when the debounced value changes
   */
  onDebouncedChange?: (value: string) => void;
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceDelay?: number;
  /**
   * Show clear button when input has value
   * @default true
   */
  showClearButton?: boolean;
  /**
   * Callback fired when clear button is clicked
   */
  onClear?: () => void;
}

/**
 * SearchInput component with debouncing
 * 
 * Features:
 * - Debounced onChange callback (default 300ms)
 * - Search icon
 * - Clear button
 * - Consistent edtech theme styling
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   placeholder="Search documents..."
 *   onDebouncedChange={(value) => setSearchQuery(value)}
 * />
 * ```
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      placeholder = 'Search...',
      onDebouncedChange,
      debounceDelay = 300,
      showClearButton = true,
      onClear,
      value: controlledValue,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      (controlledValue as string) || (defaultValue as string) || ''
    );

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const debouncedValue = useDebounce(value as string, debounceDelay);

    const onDebouncedChangeRef = React.useRef(onDebouncedChange);
    React.useEffect(() => {
      onDebouncedChangeRef.current = onDebouncedChange;
    }, [onDebouncedChange]);

    // Call onDebouncedChange when debounced value changes
    React.useEffect(() => {
      if (onDebouncedChangeRef.current && debouncedValue !== undefined) {
        hackLog.dev('SearchInput: Debounced value changed', {
          value: debouncedValue,
          delay: debounceDelay
        });
        onDebouncedChangeRef.current(debouncedValue);
      }
    }, [debouncedValue, debounceDelay]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      if (onChange) {
        onChange(e);
      }
    };

    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      if (onClear) {
        onClear();
      }
      hackLog.dev('SearchInput: Cleared', {});
    };

    const showClear = showClearButton && value && (value as string).length > 0;

    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn('pl-9', showClear && 'pr-9', className)}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
