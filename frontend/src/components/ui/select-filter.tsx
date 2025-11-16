'use client';

import * as React from 'react';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '@/lib/utils';
import hackLog from '@/lib/logger';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFilterProps {
  /**
   * Label for the select filter
   */
  label?: string;
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
  /**
   * Array of options to display
   */
  options: SelectOption[];
  /**
   * Currently selected value
   */
  value?: string;
  /**
   * Callback fired when value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Additional className for the trigger
   */
  triggerClassName?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'default';
}

/**
 * SelectFilter component - wrapper around shadcn Select
 * 
 * Features:
 * - Single select mode
 * - Optional label
 * - Consistent edtech theme styling
 * - Accessible
 * 
 * @example
 * ```tsx
 * <SelectFilter
 *   label="Status"
 *   placeholder="Select status"
 *   options={[
 *     { value: 'all', label: 'All' },
 *     { value: 'ready', label: 'Ready' },
 *     { value: 'processing', label: 'Processing' }
 *   ]}
 *   value={status}
 *   onValueChange={setStatus}
 * />
 * ```
 */
export const SelectFilter = React.forwardRef<HTMLButtonElement, SelectFilterProps>(
  (
    {
      label,
      placeholder = 'Select...',
      options,
      value,
      onValueChange,
      disabled,
      className,
      triggerClassName,
      size = 'default',
    },
    ref
  ) => {
    const handleValueChange = React.useCallback((newValue: string) => {
      if (newValue !== value) {
        hackLog.dev('SelectFilter: Value changed', {
          label,
          oldValue: value,
          newValue
        });
        onValueChange?.(newValue);
      }
    }, [value, onValueChange, label]);

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <Label htmlFor={label} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            id={label}
            size={size}
            className={cn('w-full', triggerClassName)}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

SelectFilter.displayName = 'SelectFilter';
