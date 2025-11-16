'use client';

import { motion } from 'framer-motion';
import { GroupList } from '@/components/groups/group-list';
import { GroupForm } from '@/components/groups/group-form';
import { GroupDeleteDialog } from '@/components/groups/group-delete-dialog';
import { useGroupsStore } from '@/hooks/use-groups-store';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, UsersRound } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
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

export default function GroupsPage() {
  const {
    filters,
    setOrgId,
    selectedGroup,
    isGroupDialogOpen,
    isDeleteDialogOpen,
    setGroupDialogOpen,
    setDeleteDialogOpen,
    setSelectedGroup,
  } = useGroupsStore();

  const { organizations, isLoading: isLoadingOrgs } = useOrganizations();

  const handleCreateGroup = () => {
    hackLog.dev('GroupsPage: Create group clicked');
    setSelectedGroup(null);
    setGroupDialogOpen(true);
  };

  const handleFormClose = () => {
    setGroupDialogOpen(false);
    setSelectedGroup(null);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedGroup(null);
  };

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
                  <UsersRound className="h-5 w-5" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Groups</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Manage groups to organize users and control document access
              </p>
            </div>
            <Button 
              onClick={handleCreateGroup}
              size="lg"
              className="gap-2 h-11 px-6"
            >
              <Plus className="h-5 w-5" />
              Create Group
            </Button>
          </div>
        </motion.div>

        {/* Organization Filter */}
        <motion.div variants={itemVariants}>
          <div className="rounded-xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-slate-900/40 p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs space-y-2">
                <Label htmlFor="org-filter" className="text-base font-semibold">Filter by Organization</Label>
                {isLoadingOrgs ? (
                  <SkeletonCard className="h-10" />
                ) : (
                  <Select
                    value={filters.orgId || 'all'}
                    onValueChange={(value) => setOrgId(value === 'all' ? null : value)}
                  >
                    <SelectTrigger id="org-filter">
                      <SelectValue placeholder="All Organizations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      {organizations.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No organizations available
                        </SelectItem>
                      ) : (
                        organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Groups List */}
        <motion.div variants={itemVariants}>
          <GroupList orgId={filters.orgId || undefined} />
        </motion.div>

        {/* Group Form Dialog */}
        <GroupForm
          group={selectedGroup}
          orgId={filters.orgId || undefined}
          isOpen={isGroupDialogOpen}
          onClose={handleFormClose}
        />

        {/* Delete Confirmation Dialog */}
        <GroupDeleteDialog
          group={selectedGroup}
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteClose}
        />
      </motion.div>
    </div>
  );
}
