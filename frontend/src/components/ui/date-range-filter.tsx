'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Label } from './label';
import hackLog from '@/lib/logger';

export interface DateRangeFilterProps {
  /**
   * Label for the date range filter
   */
  label?: string;
  /**
   * Currently selected date range
   */
  value?: DateRange;
  /**
   * Callback fired when date range changes
   */
  onValueChange?: (range: DateRange | undefined) => void;
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string;
  /**
   * Whether the filter is disabled
   */
  disabled?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Show preset ranges
   */
  showPresets?: boolean;
}

interface PresetRange {
  label: string;
  getValue: () => DateRange;
}

const presetRanges: PresetRange[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      return { from: lastWeek, to: today };
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setDate(today.getDate() - 30);
      return { from: lastMonth, to: today };
    },
  },
  {
    label: 'Last 90 days',
    getValue: () => {
      const today = new Date();
      const last90Days = new Date(today);
      last90Days.setDate(today.getDate() - 90);
      return { from: last90Days, to: today };
    },
  },
];

/**
 * DateRangeFilter component - date range picker with presets
 * 
 * Features:
 * - Date range selection using shadcn Calendar
 * - Preset ranges (Today, Last 7 days, Last 30 days, Last 90 days)
 * - Consistent edtech theme styling
 * - Accessible
 * 
 * @example
 * ```tsx
 * <DateRangeFilter
 *   label="Date Range"
 *   value={dateRange}
 *   onValueChange={setDateRange}
 *   showPresets
 * />
 * ```
 */
export const DateRangeFilter = React.forwardRef<
  HTMLButtonElement,
  DateRangeFilterProps
>(
  (
    {
      label,
      value,
      onValueChange,
      placeholder = 'Pick a date range',
      disabled,
      className,
      showPresets = true,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (range: DateRange | undefined) => {
      hackLog.dev('DateRangeFilter: Date range selected', {
        label,
        range
      });
      onValueChange?.(range);
    };

    const handlePresetClick = (preset: PresetRange) => {
      const range = preset.getValue();
      hackLog.dev('DateRangeFilter: Preset selected', {
        label,
        preset: preset.label,
        range
      });
      onValueChange?.(range);
      setOpen(false);
    };

    const formatDateRange = (range: DateRange | undefined) => {
      if (!range) return placeholder;
      if (range.from) {
        if (range.to) {
          return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`;
        }
        return format(range.from, 'MMM d, yyyy');
      }
      return placeholder;
    };

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <Label htmlFor={label} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={label}
              variant="outline"
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(value)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              {showPresets && (
                <div className="flex flex-col gap-1 border-r p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Presets
                  </div>
                  {presetRanges.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={value}
                  onSelect={handleSelect}
                  numberOfMonths={1}
                  disabled={disabled}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DateRangeFilter.displayName = 'DateRangeFilter';
