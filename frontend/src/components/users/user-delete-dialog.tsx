'use client';

import { User } from '@/lib/api/users';
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
import { useUserMutations } from '@/hooks/useUserMutations';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

interface UserDeleteDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  redirectAfterDelete?: boolean;
}

export function UserDeleteDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  redirectAfterDelete = false,
}: UserDeleteDialogProps) {
  const router = useRouter();
  const { deleteUser, isDeleting } = useUserMutations();

  hackLog.dev('UserDeleteDialog: Rendering', { userId: user?.id, open });

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteUser(user.id);
      onSuccess?.();
      onOpenChange(false);
      
      if (redirectAfterDelete) {
        router.push('/users' as any);
      }
    } catch (error) {
      hackLog.error('UserDeleteDialog: Failed to delete user', {
        error,
        userId: user.id,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete User</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{user?.email}</strong>?
            </p>
            <p className="text-destructive">
              This action cannot be undone. The user will be permanently removed from all
              organizations and groups.
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
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
