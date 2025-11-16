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
import { Plus, UsersRound, Building2 } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { PremiumPageLayout, itemVariants } from '@/components/layouts/premium-page-layout';
import { SectionCard } from '@/components/ui/section-card';
import hackLog from '@/lib/logger';

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
    <PremiumPageLayout
      icon={UsersRound}
      title="Groups"
      description="Manage groups to organize users and control document access"
      actions={
        <Button 
          onClick={handleCreateGroup}
          size="lg"
          className="gap-2 h-11 px-6 btn-super"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </Button>
      }
    >
      {/* Organization Filter */}
      <motion.div variants={itemVariants}>
        <SectionCard
          title="Filter by Organization"
          icon={Building2}
          className="shadow-lg"
        >
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs space-y-2">
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
        </SectionCard>
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
    </PremiumPageLayout>
  );
}
