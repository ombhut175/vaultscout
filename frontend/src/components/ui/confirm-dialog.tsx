'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { cn } from '@/lib/utils';
import hackLog from '@/lib/logger';

export interface ConfirmDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  /**
   * Callback fired when open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Callback fired when confirm button is clicked
   * Can be async for loading state
   */
  onConfirm: () => void | Promise<void>;
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
  description: string;
  /**
   * Confirm button text
   * @default "Confirm"
   */
  confirmText?: string;
  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;
  /**
   * Variant for the confirm button
   * @default "default"
   */
  variant?: 'default' | 'destructive';
  /**
   * Whether the action is loading
   */
  loading?: boolean;
  /**
   * Additional content to render in the dialog
   */
  children?: React.ReactNode;
}

/**
 * ConfirmDialog component - wrapper around AlertDialog
 * 
 * Features:
 * - Async operation support with loading state
 * - Destructive variant for delete operations
 * - Consistent edtech theme styling
 * - Accessible
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={handleDelete}
 *   title="Delete User"
 *   description="Are you sure you want to delete this user?"
 *   variant="destructive"
 *   confirmText="Delete"
 * />
 * ```
 */
export const ConfirmDialog = React.forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      open,
      onOpenChange,
      onConfirm,
      onCancel,
      title,
      description,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'default',
      loading: externalLoading,
      children,
    },
    ref
  ) => {
    const [internalLoading, setInternalLoading] = React.useState(false);
    const loading = externalLoading !== undefined ? externalLoading : internalLoading;

    const handleConfirm = async () => {
      try {
        setInternalLoading(true);
        hackLog.dev('ConfirmDialog: Confirm clicked', {
          title,
          variant
        });
        
        const result = onConfirm();
        if (result instanceof Promise) {
          await result;
        }
        
        onOpenChange(false);
      } catch (error) {
        hackLog.error('ConfirmDialog: Confirm failed', { error });
        // Error is handled by the caller
      } finally {
        setInternalLoading(false);
      }
    };

    const handleCancel = () => {
      hackLog.dev('ConfirmDialog: Cancel clicked', { title });
      if (onCancel) {
        onCancel();
      }
      onOpenChange(false);
    };

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent ref={ref}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {children && <div className="py-4">{children}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={loading}>
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                variant === 'destructive' &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              )}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Loading...' : confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';
