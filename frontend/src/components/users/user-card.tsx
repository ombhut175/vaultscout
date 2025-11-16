'use client';

import { User } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useUsersStore } from '@/hooks/use-users-store';
import hackLog from '@/lib/logger';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  showActions?: boolean;
}

export function UserCard({ user, onEdit, onDelete, showActions = true }: UserCardProps) {
  const router = useRouter();
  const { setSelectedUser, setDeleteDialogOpen } = useUsersStore();

  const handleViewDetails = () => {
    hackLog.dev('UserCard: View details clicked', { userId: user.id });
    router.push(`/users/${user.id}` as any);
  };

  const handleEdit = () => {
    hackLog.dev('UserCard: Edit clicked', { userId: user.id });
    setSelectedUser(user);
    onEdit?.(user);
  };

  const handleDelete = () => {
    hackLog.dev('UserCard: Delete clicked', { userId: user.id });
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    onDelete?.(user);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{user.email}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Joined {formatDate(user.createdAt)}</span>
        </div>
        <div className="mt-3">
          <Badge variant="secondary">ID: {user.id.slice(0, 8)}...</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
