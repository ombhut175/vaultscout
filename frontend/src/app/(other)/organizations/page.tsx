'use client';

import { OrganizationList } from '@/components/organizations/organization-list';
import { OrganizationForm } from '@/components/organizations/organization-form';
import { OrganizationDeleteDialog } from '@/components/organizations/organization-delete-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useOrgsStore } from '@/hooks/use-orgs-store';
import hackLog from '@/lib/logger';

export default function OrganizationsPage() {
  const { 
    selectedOrg, 
    isOrgDialogOpen, 
    isDeleteDialogOpen, 
    setOrgDialogOpen, 
    setDeleteDialogOpen,
    setSelectedOrg 
  } = useOrgsStore();

  hackLog.dev('OrganizationsPage: Rendering');

  const handleCreateClick = () => {
    setSelectedOrg(null); // Clear selection for create mode
    setOrgDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizations and their settings
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Organization List */}
      <OrganizationList />

      {/* Create/Edit Organization Dialog */}
      <OrganizationForm
        organization={selectedOrg}
        open={isOrgDialogOpen}
        onOpenChange={setOrgDialogOpen}
      />

      {/* Delete Organization Dialog */}
      <OrganizationDeleteDialog
        organization={selectedOrg}
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
