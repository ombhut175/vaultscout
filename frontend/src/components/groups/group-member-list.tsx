'use client';

import { useGroup } from '@/hooks/useGroup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, UserPlus, UserMinus } from 'lucide-react';
import { useGroupsStore } from '@/hooks/use-groups-store';
import { useGroupMutations } from '@/hooks/useGroupMutations';
import { toast } from 'sonner';
import hackLog from '@/lib/logger';

interface GroupMemberListProps {
  groupId: string;
  showActions?: boolean;
}

export function GroupMemberList({ groupId, showActions = true }: GroupMemberListProps) {
  const { group, isLoading, isError, error, mutate } = useGroup(groupId);
  const { setSelectedGroup, setAddMemberDialogOpen } = useGroupsStore();
  const { removeMember, isRemovingMember } = useGroupMutations();

  hackLog.dev('GroupMemberList: Rendering', {
    groupId,
    isLoading,
    isError,
    memberCount: group?.members?.length || 0,
  });

  const handleAddMember = () => {
    if (group) {
      hackLog.dev('GroupMemberList: Add member clicked', { groupId: group.id });
      setSelectedGroup(group);
      setAddMemberDialogOpen(true);
    }
  };

  const handleRemoveMember = async (userId: string, userEmail: string) => {
    if (!group) return;

    hackLog.dev('GroupMemberList: Remove member clicked', { groupId: group.id, userId });

    try {
      await removeMember(group.id, userId);
      toast.success(`Removed ${userEmail} from group`);
      mutate(); // Revalidate group data
    } catch (error) {
      hackLog.error('Failed to remove member', { error, groupId: group.id, userId });
      // Error toast is handled by useGroupMutations
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError || !group) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load group members. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  const members = group.members || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Members ({members.length})</CardTitle>
          {showActions && (
            <Button onClick={handleAddMember} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No members in this group yet. Add members to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell>{formatDate(member.joinedAt)}</TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id, member.email)}
                        disabled={isRemovingMember}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
