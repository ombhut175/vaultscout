'use client';

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
import { Plus } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
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

  // Fetch organizations from API
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground mt-2">
            Manage groups to organize users and control document access
          </p>
        </div>
        <Button onClick={handleCreateGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Organization Filter */}
      <div className="flex items-end gap-4">
        <div className="flex-1 max-w-xs space-y-2">
          <Label htmlFor="org-filter">Filter by Organization</Label>
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

      {/* Groups List */}
      <GroupList orgId={filters.orgId || undefined} />

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
    </div>
  );
}
