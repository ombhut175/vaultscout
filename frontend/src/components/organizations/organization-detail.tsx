'use client';

import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2, Calendar, Edit, Database } from 'lucide-react';
import { useOrgsStore } from '@/hooks/use-orgs-store';
import hackLog from '@/lib/logger';

interface OrganizationDetailProps {
  orgId: string;
  showEditButton?: boolean;
}

export function OrganizationDetail({ orgId, showEditButton = true }: OrganizationDetailProps) {
  const { organization, isLoading, isError, error } = useOrganization(orgId);
  const { setSelectedOrg, setOrgDialogOpen } = useOrgsStore();

  const handleEdit = () => {
    if (organization) {
      hackLog.dev('OrganizationDetail: Edit clicked', { orgId: organization.id });
      setSelectedOrg(organization);
      setOrgDialogOpen(true);
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
  if (isError || !organization) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load organization details. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">{organization.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Organization Details
              </p>
            </div>
          </div>
          {showEditButton && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Organization Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Database className="h-4 w-4" />
              Pinecone Namespace
            </div>
            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
              {organization.pineconeNamespace}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created
            </div>
            <p className="text-sm">
              {formatDate(organization.createdAt)}
            </p>
          </div>
        </div>

        {/* Organization ID */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Organization ID
          </div>
          <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
            {organization.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
