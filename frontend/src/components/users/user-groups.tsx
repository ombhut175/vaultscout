'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

interface Group {
  id: string;
  name: string;
  orgId: string;
  memberCount?: number;
}

interface UserGroupsProps {
  userId: string;
  groups?: Group[];
  isLoading?: boolean;
  onAddToGroup?: () => void;
  isAdmin?: boolean;
}

export function UserGroups({
  userId,
  groups = [],
  isLoading = false,
  onAddToGroup,
  isAdmin = false,
}: UserGroupsProps) {
  const router = useRouter();

  hackLog.dev('UserGroups: Rendering', {
    userId,
    groupsCount: groups.length,
    isLoading,
  });

  const handleGroupClick = (groupId: string) => {
    hackLog.dev('UserGroups: Group clicked', { groupId });
    router.push(`/groups/${groupId}` as any);
  };

  if (isLoading) {
    return <UserGroupsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Groups</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={onAddToGroup}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Group
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Not a member of any groups</p>
            {isAdmin && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onAddToGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Add to Group
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <button
                  onClick={() => handleGroupClick(group.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate hover:underline">{group.name}</p>
                    {group.memberCount !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    )}
                  </div>
                </button>
                <Badge variant="secondary">Member</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserGroupsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 border rounded-lg">
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
