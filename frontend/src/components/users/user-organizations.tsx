'use client';

import { UserWithOrganizations } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Plus, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

interface UserOrganizationsProps {
  user: UserWithOrganizations;
  onAddToOrg?: () => void;
  onRemoveFromOrg?: (orgId: string) => void;
  isAdmin?: boolean;
}

export function UserOrganizations({
  user,
  onAddToOrg,
  onRemoveFromOrg,
  isAdmin = false,
}: UserOrganizationsProps) {
  const router = useRouter();

  hackLog.dev('UserOrganizations: Rendering', {
    userId: user.id,
    organizationsCount: user.organizations?.length || 0,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleOrgClick = (orgId: string) => {
    hackLog.dev('UserOrganizations: Organization clicked', { orgId });
    router.push(`/organizations/${orgId}` as any);
  };

  const handleRemove = (orgId: string, orgName: string) => {
    hackLog.dev('UserOrganizations: Remove from organization clicked', { orgId, orgName });
    onRemoveFromOrg?.(orgId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        {isAdmin && (
          <CardAction>
            <Button size="sm" onClick={onAddToOrg}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Organization
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {!user.organizations || user.organizations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Not a member of any organizations</p>
            {isAdmin && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onAddToOrg}>
                <Plus className="h-4 w-4 mr-2" />
                Add to Organization
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {user.organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => handleOrgClick(org.id)}
                      className="font-medium hover:underline text-left truncate"
                    >
                      {org.name}
                    </button>
                    <Badge variant={getRoleBadgeVariant(org.role)}>{org.role}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {formatDate(org.joinedAt)}</span>
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(org.id, org.name)}
                    className="ml-2 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserOrganizationsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
