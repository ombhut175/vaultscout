'use client';

import { use } from 'react';
import { GroupDetail } from '@/components/groups/group-detail';
import { GroupMemberList } from '@/components/groups/group-member-list';
import { GroupForm } from '@/components/groups/group-form';
import { GroupDeleteDialog } from '@/components/groups/group-delete-dialog';
import { AddMemberForm } from '@/components/groups/add-member-form';
import { useGroupsStore } from '@/hooks/use-groups-store';
import { useGroup } from '@/hooks/useGroup';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2 } from 'lucide-react';

import Link from 'next/link';
import hackLog from '@/lib/logger';

interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = use(params);
  const { group, isLoading, isError, error } = useGroup(id);
  const {
    selectedGroup,
    isGroupDialogOpen,
    isDeleteDialogOpen,
    isAddMemberDialogOpen,
    setGroupDialogOpen,
    setDeleteDialogOpen,
    setAddMemberDialogOpen,
    setSelectedGroup,
  } = useGroupsStore();

  hackLog.dev('GroupDetailPage: Rendering', { groupId: id, isLoading, isError });

  const handleDelete = () => {
    if (group) {
      hackLog.dev('GroupDetailPage: Delete clicked', { groupId: group.id });
      setSelectedGroup(group);
      setDeleteDialogOpen(true);
    }
  };

  const handleFormClose = () => {
    setGroupDialogOpen(false);
    setSelectedGroup(null);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedGroup(null);
  };

  const handleAddMemberClose = () => {
    setAddMemberDialogOpen(false);
    setSelectedGroup(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (isError || !group) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || 'Failed to load group details. Please try again.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href={"/groups" as any}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Back Button */}
      <Link href={"/groups" as any}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground mt-2">Group details and members</p>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Group
        </Button>
      </div>

      {/* Group Details */}
      <GroupDetail groupId={id} showEditButton={true} />

      {/* Group Members */}
      <GroupMemberList groupId={id} showActions={true} />

      {/* Group Form Dialog */}
      <GroupForm
        group={selectedGroup || group}
        isOpen={isGroupDialogOpen}
        onClose={handleFormClose}
      />

      {/* Add Member Dialog */}
      <AddMemberForm
        group={group}
        isOpen={isAddMemberDialogOpen}
        onClose={handleAddMemberClose}
      />

      {/* Delete Confirmation Dialog */}
      <GroupDeleteDialog
        group={selectedGroup || group}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteClose}
      />
    </div>
  );
}
