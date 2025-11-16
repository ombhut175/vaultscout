'use client';

import { useGroups } from '@/hooks/useGroups';
import { useGroupsStore } from '@/hooks/use-groups-store';
import { GroupCard } from './group-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import hackLog from '@/lib/logger';

interface GroupListProps {
  orgId?: string;
}

export function GroupList({ orgId }: GroupListProps) {
  const { filters } = useGroupsStore();
  const { groups, isLoading, isError, error } = useGroups({
    orgId: orgId || filters.orgId || undefined,
  });

  hackLog.dev('GroupList: Rendering', {
    groupsCount: groups.length,
    isLoading,
    isError,
    orgId: orgId || filters.orgId,
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load groups. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No groups found. Create a group to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group count */}
      <div className="text-sm text-muted-foreground">
        Showing {groups.length} group{groups.length !== 1 ? 's' : ''}
      </div>

      {/* Group grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
