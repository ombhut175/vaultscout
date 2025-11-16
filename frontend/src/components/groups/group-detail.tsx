'use client';

import { useGroup } from '@/hooks/useGroup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Building2, Users, Edit } from 'lucide-react';
import { useGroupsStore } from '@/hooks/use-groups-store';
import hackLog from '@/lib/logger';

interface GroupDetailProps {
  groupId: string;
  showEditButton?: boolean;
}

export function GroupDetail({ groupId, showEditButton = true }: GroupDetailProps) {
  const { group, isLoading, isError, error } = useGroup(groupId);
  const { setSelectedGroup, setGroupDialogOpen } = useGroupsStore();

  hackLog.dev('GroupDetail: Rendering', {
    groupId,
    isLoading,
    isError,
    hasGroup: !!group,
  });

  const handleEdit = () => {
    if (group) {
      hackLog.dev('GroupDetail: Edit clicked', { groupId: group.id });
      setSelectedGroup(group);
      setGroupDialogOpen(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
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
          {error?.message || 'Failed to load group details. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{group.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          {showEditButton && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Organization */}
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Organization</p>
            <p className="text-sm text-muted-foreground">{group.orgId}</p>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Created</p>
            <p className="text-sm text-muted-foreground">{formatDate(group.createdAt)}</p>
          </div>
        </div>

        {/* Group ID */}
        <div>
          <p className="text-sm font-medium mb-1">Group ID</p>
          <code className="text-xs bg-muted px-2 py-1 rounded">{group.id}</code>
        </div>
      </CardContent>
    </Card>
  );
}
