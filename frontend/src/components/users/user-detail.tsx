'use client';

import { UserWithOrganizations } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, Key, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import hackLog from '@/lib/logger';

interface UserDetailProps {
  user: UserWithOrganizations;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export function UserDetail({ user, onEdit, onDelete, isAdmin = false }: UserDetailProps) {
  hackLog.dev('UserDetail: Rendering', { userId: user.id, email: user.email });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-2xl">User Details</CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{user.email}</p>
          </div>
        </div>

        {/* User ID */}
        <div className="flex items-start gap-3">
          <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <p className="text-base font-mono text-sm">{user.id}</p>
          </div>
        </div>

        {/* External User ID */}
        <div className="flex items-start gap-3">
          <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">External User ID</p>
            <p className="text-base font-mono text-sm">{user.externalUserId}</p>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Created At</p>
            <p className="text-base">{formatDate(user.createdAt)}</p>
          </div>
        </div>

        {/* Organizations Count */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Organizations</p>
            <Badge variant="secondary">{user.organizations?.length || 0}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full max-w-md" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
