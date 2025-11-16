'use client';

import { Organization } from '@/lib/api/organizations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOrganizationMutations } from '@/hooks/useOrganizationMutations';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

interface OrganizationDeleteDialogProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  redirectAfterDelete?: boolean;
}

export function OrganizationDeleteDialog({
  organization,
  open,
  onOpenChange,
  onSuccess,
  redirectAfterDelete = true,
}: OrganizationDeleteDialogProps) {
  const router = useRouter();
  const { deleteOrganization, isDeleting } = useOrganizationMutations();

  hackLog.dev('OrganizationDeleteDialog: Rendering', { 
    orgId: organization?.id, 
    open 
  });

  const handleDelete = async () => {
    if (!organization) return;

    try {
      await deleteOrganization(organization.id);
      onSuccess?.();
      onOpenChange(false);
      
      if (redirectAfterDelete) {
        router.push('/organizations' as any);
      }
    } catch (error) {
      hackLog.error('OrganizationDeleteDialog: Failed to delete organization', {
        error,
        orgId: organization.id,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete <strong>{organization?.name}</strong>?
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-2">
              <p className="text-destructive font-semibold">
                ⚠️ Warning: This is a cascade delete operation
              </p>
              <p className="text-sm text-destructive">
                This action will permanently delete:
              </p>
              <ul className="text-sm text-destructive list-disc list-inside space-y-1">
                <li>All users in this organization</li>
                <li>All groups in this organization</li>
                <li>All documents in this organization</li>
                <li>All associated data and embeddings</li>
              </ul>
            </div>
            <p className="text-destructive font-medium">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Organization
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
