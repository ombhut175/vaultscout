'use client';

import { motion } from 'framer-motion';
import { UserList } from '@/components/users/user-list';
import { UserForm } from '@/components/users/user-form';
import { UserDeleteDialog } from '@/components/users/user-delete-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { useUsersStore } from '@/hooks/use-users-store';
import { PremiumPageLayout, itemVariants } from '@/components/layouts/premium-page-layout';
import hackLog from '@/lib/logger';

export default function UsersPage() {
  const { selectedUser, isUserDialogOpen, isDeleteDialogOpen, setUserDialogOpen, setDeleteDialogOpen } = useUsersStore();

  hackLog.dev('UsersPage: Rendering');

  return (
    <PremiumPageLayout
      icon={Users}
      title="Users"
      description="Manage users and their organization memberships"
      actions={
        <Button 
          onClick={() => setUserDialogOpen(true)}
          size="lg"
          className="gap-2 h-11 px-6 btn-super"
        >
          <Plus className="h-5 w-5" />
          Add User
        </Button>
      }
    >
      {/* User List */}
      <motion.div variants={itemVariants}>
        <UserList />
      </motion.div>

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
    </PremiumPageLayout>
  );
}
