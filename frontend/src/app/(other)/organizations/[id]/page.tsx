'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrganization } from '@/hooks/useOrganization';
import { OrganizationDetail } from '@/components/organizations/organization-detail';
import { OrganizationStats } from '@/components/organizations/organization-stats';
import { OrganizationForm } from '@/components/organizations/organization-form';
import { OrganizationDeleteDialog } from '@/components/organizations/organization-delete-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useOrgsStore } from '@/hooks/use-orgs-store';
import hackLog from '@/lib/logger';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  
  const { organization, isLoading, isError, error, mutate } = useOrganization(orgId);
  const { setSelectedOrg, setOrgDialogOpen, setDeleteDialogOpen } = useOrgsStore();

  hackLog.dev('OrganizationDetailPage: Rendering', { orgId, isLoading, isError });

  const handleEdit = () => {
    if (organization) {
      setSelectedOrg(organization);
      setOrgDialogOpen(true);
    }
  };

  const handleDelete = () => {
    if (organization) {
      setSelectedOrg(organization);
      setDeleteDialogOpen(true);
    }
  };

  const handleBack = () => {
    router.push('/organizations' as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizations
        </Button>
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !organization) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizations
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load organization details. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Organizations
      </Button>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Organization Stats */}
      <OrganizationStats orgId={orgId} />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OrganizationDetail orgId={orgId} showEditButton={false} />
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Member management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Group management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Document management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Organization Dialog */}
      <OrganizationForm
        organization={organization}
        open={useOrgsStore.getState().isOrgDialogOpen}
        onOpenChange={setOrgDialogOpen}
        onSuccess={() => mutate()}
      />

      {/* Delete Organization Dialog */}
      <OrganizationDeleteDialog
        organization={organization}
        open={useOrgsStore.getState().isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        redirectAfterDelete={true}
      />
    </div>
  );
}
