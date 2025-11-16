'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useGroups } from '@/hooks/useGroups';
import { UserDetail, UserDetailSkeleton } from '@/components/users/user-detail';
import { UserOrganizations, UserOrganizationsSkeleton } from '@/components/users/user-organizations';
import { UserGroups, UserGroupsSkeleton } from '@/components/users/user-groups';
import { UserForm } from '@/components/users/user-form';
import { UserDeleteDialog } from '@/components/users/user-delete-dialog';
import { AddToOrgForm } from '@/components/users/add-to-org-form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useUserMutations } from '@/hooks/useUserMutations';
import { useOrganizationMembership } from '@/hooks/useOrganizationMembership';
import hackLog from '@/lib/logger';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const { user, isLoading, isError, error, mutate } = useUser(userId);
  const { removeFromOrganization } = useUserMutations();
  const { currentRole } = useOrganizationMembership();
  
  // Fetch user's groups
  const { groups, isLoading: isLoadingGroups } = useGroups({ userId });
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddToOrgDialogOpen, setIsAddToOrgDialogOpen] = useState(false);

  // Check if user is admin
  const isAdmin = currentRole === 'admin';

  hackLog.dev('UserDetailPage: Rendering', { 
    userId, 
    isLoading, 
    isError, 
    isAdmin, 
    currentRole,
    groupsCount: groups.length,
    isLoadingGroups
  });

  const handleRemoveFromOrg = async (orgId: string) => {
    try {
      await removeFromOrganization(userId, orgId);
      mutate(); // Revalidate user data
    } catch (error) {
      hackLog.error('UserDetailPage: Failed to remove user from organization', {
        error,
        userId,
        orgId,
      });
    }
  };

  const handleBack = () => {
    router.push('/users' as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <UserDetailSkeleton />
        <div className="grid gap-6 md:grid-cols-2">
          <UserOrganizationsSkeleton />
          <UserGroupsSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !user) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load user details. Please try again.'}
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
        Back to Users
      </Button>

      {/* User Details */}
      <UserDetail
        user={user}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Organizations and Groups */}
      <div className="grid gap-6 md:grid-cols-2">
        <UserOrganizations
          user={user}
          onAddToOrg={() => setIsAddToOrgDialogOpen(true)}
          onRemoveFromOrg={handleRemoveFromOrg}
          isAdmin={isAdmin}
        />
        <UserGroups
          userId={userId}
          groups={groups}
          isLoading={isLoadingGroups}
          isAdmin={isAdmin}
        />
      </div>

      {/* Edit User Dialog */}
      <UserForm
        user={user}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => mutate()}
      />

      {/* Delete User Dialog */}
      <UserDeleteDialog
        user={user}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        redirectAfterDelete={true}
      />

      {/* Add to Organization Dialog */}
      <AddToOrgForm
        user={user}
        open={isAddToOrgDialogOpen}
        onOpenChange={setIsAddToOrgDialogOpen}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
