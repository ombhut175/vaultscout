import { useState } from 'react';
import { mutate } from 'swr';
import { OrganizationsAPI, CreateOrganizationRequest, UpdateOrganizationRequest } from '@/lib/api/organizations';
import { handleError } from '@/helpers/errors';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { toast } from 'sonner';

/**
 * Hook for organization CRUD operations
 * Handles mutations and SWR cache revalidation
 */
export function useOrganizationMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create organization
   */
  const createOrganization = async (data: CreateOrganizationRequest) => {
    hackLog.dev('createOrganization called', { data });
    setIsCreating(true);

    try {
      const newOrganization = await OrganizationsAPI.create(data);

      // Revalidate SWR cache
      await mutate(API_ENDPOINTS.ORGANIZATIONS.LIST);

      toast.success('Organization created successfully');
      hackLog.dev('Organization created successfully', { orgId: newOrganization.id });

      return newOrganization;
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update organization
   */
  const updateOrganization = async (orgId: string, data: UpdateOrganizationRequest) => {
    hackLog.dev('updateOrganization called', { orgId, data });
    setIsUpdating(true);

    try {
      const updatedOrganization = await OrganizationsAPI.update(orgId, data);

      // Revalidate SWR cache
      const orgUrl = typeof API_ENDPOINTS.ORGANIZATIONS.GET === 'function'
        ? API_ENDPOINTS.ORGANIZATIONS.GET(orgId)
        : `organizations/${orgId}`;
      await mutate(orgUrl);
      await mutate(API_ENDPOINTS.ORGANIZATIONS.LIST);

      toast.success('Organization updated successfully');
      hackLog.dev('Organization updated successfully', { orgId });

      return updatedOrganization;
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete organization
   */
  const deleteOrganization = async (orgId: string) => {
    hackLog.dev('deleteOrganization called', { orgId });
    setIsDeleting(true);

    try {
      await OrganizationsAPI.delete(orgId);

      // Revalidate SWR cache
      await mutate(API_ENDPOINTS.ORGANIZATIONS.LIST);

      toast.success('Organization deleted successfully');
      hackLog.dev('Organization deleted successfully', { orgId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    isCreating,
    isUpdating,
    isDeleting
  };
}
