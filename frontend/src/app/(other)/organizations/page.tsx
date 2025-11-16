'use client';

import { motion } from 'framer-motion';
import { OrganizationList } from '@/components/organizations/organization-list';
import { OrganizationForm } from '@/components/organizations/organization-form';
import { OrganizationDeleteDialog } from '@/components/organizations/organization-delete-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { useOrgsStore } from '@/hooks/use-orgs-store';
import { PremiumPageLayout, itemVariants } from '@/components/layouts/premium-page-layout';
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
    setSelectedOrg(null);
    setOrgDialogOpen(true);
  };

  return (
    <PremiumPageLayout
      icon={Building2}
      title="Organizations"
      description="Manage organizations and their settings"
      actions={
        <Button 
          onClick={handleCreateClick}
          size="lg"
          className="gap-2 h-11 px-6 btn-super"
        >
          <Plus className="h-5 w-5" />
          Create Organization
        </Button>
      }
    >
      {/* Organization List */}
      <motion.div variants={itemVariants}>
        <OrganizationList />
      </motion.div>

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
    </PremiumPageLayout>
  );
}
