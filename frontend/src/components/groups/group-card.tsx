'use client';

import { Group } from '@/lib/api/groups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useGroupsStore } from '@/hooks/use-groups-store';
import hackLog from '@/lib/logger';

interface GroupCardProps {
  group: Group;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  showActions?: boolean;
}

export function GroupCard({ group, onEdit, onDelete, showActions = true }: GroupCardProps) {
  const router = useRouter();
  const { setSelectedGroup, setDeleteDialogOpen, setGroupDialogOpen } = useGroupsStore();

  const handleViewDetails = () => {
    hackLog.dev('GroupCard: View details clicked', { groupId: group.id });
    router.push(`/groups/${group.id}` as any);
  };

  const handleEdit = () => {
    hackLog.dev('GroupCard: Edit clicked', { groupId: group.id });
    setSelectedGroup(group);
    setGroupDialogOpen(true);
    onEdit?.(group);
  };

  const handleDelete = () => {
    hackLog.dev('GroupCard: Delete clicked', { groupId: group.id });
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
    onDelete?.(group);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{group.memberCount || 0} member{group.memberCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-3">
          <Badge variant="secondary">ID: {group.id.slice(0, 8)}...</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
