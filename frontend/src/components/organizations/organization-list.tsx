'use client';

import { useOrganizations } from '@/hooks/useOrganizations';
import { OrganizationCard } from './organization-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import hackLog from '@/lib/logger';

export function OrganizationList() {
  const { organizations, isLoading, isError, error } = useOrganizations();

  hackLog.dev('OrganizationList: Rendering', {
    organizationsCount: organizations.length,
    isLoading,
    isError,
  });

  // Loading skeleton
  if (isLoading) {
    return (
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
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load organizations. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No organizations found. Create an organization to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization count */}
      <div className="text-sm text-muted-foreground">
        Showing {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
      </div>

      {/* Organization grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => (
          <OrganizationCard key={organization.id} organization={organization} />
        ))}
      </div>
    </div>
  );
}
