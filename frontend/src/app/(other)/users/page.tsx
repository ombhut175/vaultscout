'use client';

import { motion } from 'framer-motion';
import { UserList } from '@/components/users/user-list';
import { UserForm } from '@/components/users/user-form';
import { UserDeleteDialog } from '@/components/users/user-delete-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { useUsersStore } from '@/hooks/use-users-store';
import hackLog from '@/lib/logger';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function UsersPage() {
  const { selectedUser, isUserDialogOpen, isDeleteDialogOpen, setUserDialogOpen, setDeleteDialogOpen } = useUsersStore();

  hackLog.dev('UsersPage: Rendering');

  return (
    <div className="relative min-h-full bg-gradient-to-b from-white to-slate-50 text-slate-900 transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100">
      {/* Background decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Users</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Manage users and their organization memberships
              </p>
            </div>
            <Button 
              onClick={() => setUserDialogOpen(true)}
              size="lg"
              className="gap-2 h-11 px-6"
            >
              <Plus className="h-5 w-5" />
              Add User
            </Button>
          </div>
        </motion.div>

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
      </motion.div>
    </div>
  );
}
