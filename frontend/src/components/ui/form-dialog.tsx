'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import hackLog from '@/lib/logger';

export interface FormDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  /**
   * Callback fired when open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Callback fired when form is submitted
   * Can be async for loading state
   */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  /**
   * Callback fired when cancel button is clicked
   */
  onCancel?: () => void;
  /**
   * Dialog title
   */
  title: string;
  /**
   * Dialog description
   */
  description?: string;
  /**
   * Submit button text
   * @default "Submit"
   */
  submitText?: string;
  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;
  /**
   * Whether the form is submitting
   */
  loading?: boolean;
  /**
   * Whether the submit button is disabled
   */
  disabled?: boolean;
  /**
   * Form content
   */
  children: React.ReactNode;
  /**
   * Additional className for the dialog content
   */
  className?: string;
  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean;
}

/**
 * FormDialog component - wrapper around Dialog with form patterns
 * 
 * Features:
 * - Form submission with loading state
 * - Cancel and submit buttons
 * - Consistent edtech theme styling
 * - Accessible
 * 
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSubmit={handleSubmit}
 *   title="Create User"
 *   description="Enter user details"
 *   submitText="Create"
 * >
 *   <Input name="email" placeholder="Email" />
 *   <Input name="name" placeholder="Name" />
 * </FormDialog>
 * ```
 */
export const FormDialog = React.forwardRef<HTMLDivElement, FormDialogProps>(
  (
    {
      open,
      onOpenChange,
      onSubmit,
      onCancel,
      title,
      description,
      submitText = 'Submit',
      cancelText = 'Cancel',
      loading: externalLoading,
      disabled,
      children,
      className,
      showCloseButton = true,
    },
    ref
  ) => {
    const [internalLoading, setInternalLoading] = React.useState(false);
    const loading = externalLoading !== undefined ? externalLoading : internalLoading;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      try {
        setInternalLoading(true);
        hackLog.dev('FormDialog: Form submitted', { title });
        
        const result = onSubmit(e);
        if (result instanceof Promise) {
          await result;
        }
        
        // Don't auto-close - let the parent handle it after successful submission
      } catch (error) {
        hackLog.error('FormDialog: Form submission failed', { error });
        // Error is handled by the caller
      } finally {
        setInternalLoading(false);
      }
    };

    const handleCancel = () => {
      hackLog.dev('FormDialog: Cancel clicked', { title });
      if (onCancel) {
        onCancel();
      }
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={ref}
          className={className}
          showCloseButton={showCloseButton}
        >
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <div className="py-4 space-y-4">{children}</div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button type="submit" disabled={loading || disabled}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Submitting...' : submitText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

FormDialog.displayName = 'FormDialog';
