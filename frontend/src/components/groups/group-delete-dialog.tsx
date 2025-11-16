'use client';

import { useGroupMutations } from '@/hooks/useGroupMutations';
import { Group } from '@/lib/api/groups';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

interface GroupDeleteDialogProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GroupDeleteDialog({
  group,
  isOpen,
  onClose,
  onSuccess,
}: GroupDeleteDialogProps) {
  const router = useRouter();
  const { deleteGroup, isDeleting } = useGroupMutations();

  const handleConfirm = async () => {
    if (!group) return;

    hackLog.dev('GroupDeleteDialog: Delete confirmed', { groupId: group.id });

    try {
      await deleteGroup(group.id);
      onSuccess?.();
      onClose();
      
      // Redirect to groups list after successful delete
      router.push('/groups' as any);
    } catch (error) {
      hackLog.error('GroupDeleteDialog: Delete failed', { error, groupId: group.id });
      // Error toast is handled by useGroupMutations
      // Keep dialog open on error so user can retry or cancel
    }
  };

  if (!group) return null;

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={onClose}
      onConfirm={handleConfirm}
      title="Delete Group"
      description={`Are you sure you want to delete "${group.name}"? This action cannot be undone.`}
      confirmText="Delete Group"
      cancelText="Cancel"
      variant="destructive"
      loading={isDeleting}
    >
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> This group cannot be deleted if it is used in any document
          ACLs. Please remove the group from all document access controls before deleting.
        </AlertDescription>
      </Alert>
    </ConfirmDialog>
  );
}
