'use client';

import { UserList } from '@/components/users/user-list';
import { UserForm } from '@/components/users/user-form';
import { UserDeleteDialog } from '@/components/users/user-delete-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useUsersStore } from '@/hooks/use-users-store';
import hackLog from '@/lib/logger';

export default function UsersPage() {
  const { selectedUser, isUserDialogOpen, isDeleteDialogOpen, setUserDialogOpen, setDeleteDialogOpen } = useUsersStore();

  hackLog.dev('UsersPage: Rendering');

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage users and their organization memberships
          </p>
        </div>
        <Button onClick={() => setUserDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* User List */}
      <UserList />

      {/* Edit User Dialog */}
      <UserForm
        user={selectedUser}
        open={isUserDialogOpen}
        onOpenChange={setUserDialogOpen}
      />

      {/* Delete User Dialog */}
      <UserDeleteDialog
        user={selectedUser}
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
