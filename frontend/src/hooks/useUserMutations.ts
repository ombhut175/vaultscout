import { useState } from 'react';
import { mutate } from 'swr';
import { UsersAPI, UpdateUserRequest, AddToOrganizationRequest } from '@/lib/api/users';
import { handleError } from '@/helpers/errors';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { toast } from 'sonner';

/**
 * Hook for user CRUD operations
 * Handles mutations and SWR cache revalidation
 */
export function useUserMutations() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingToOrg, setIsAddingToOrg] = useState(false);
  const [isRemovingFromOrg, setIsRemovingFromOrg] = useState(false);

  /**
   * Update user
   */
  const updateUser = async (userId: string, data: UpdateUserRequest) => {
    hackLog.dev('updateUser called', { userId, data });
    setIsUpdating(true);

    try {
      const updatedUser = await UsersAPI.update(userId, data);

      // Revalidate SWR cache
      const userUrl = typeof API_ENDPOINTS.USERS.GET === 'function'
        ? API_ENDPOINTS.USERS.GET(userId)
        : `users/${userId}`;
      await mutate(userUrl);
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.USERS.LIST));

      toast.success('User updated successfully');
      hackLog.dev('User updated successfully', { userId });

      return updatedUser;
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (userId: string) => {
    hackLog.dev('deleteUser called', { userId });
    setIsDeleting(true);

    try {
      await UsersAPI.delete(userId);

      // Revalidate SWR cache
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.USERS.LIST));

      toast.success('User deleted successfully');
      hackLog.dev('User deleted successfully', { userId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Add user to organization
   */
  const addToOrganization = async (userId: string, data: AddToOrganizationRequest) => {
    hackLog.dev('addToOrganization called', { userId, data });
    setIsAddingToOrg(true);

    try {
      await UsersAPI.addToOrganization(userId, data);

      // Revalidate SWR cache
      const userUrl = typeof API_ENDPOINTS.USERS.GET === 'function'
        ? API_ENDPOINTS.USERS.GET(userId)
        : `users/${userId}`;
      await mutate(userUrl);
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.USERS.LIST));

      toast.success('User added to organization successfully');
      hackLog.dev('User added to organization successfully', { userId, orgId: data.orgId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsAddingToOrg(false);
    }
  };

  /**
   * Remove user from organization
   */
  const removeFromOrganization = async (userId: string, orgId: string) => {
    hackLog.dev('removeFromOrganization called', { userId, orgId });
    setIsRemovingFromOrg(true);

    try {
      await UsersAPI.removeFromOrganization(userId, orgId);

      // Revalidate SWR cache
      const userUrl = typeof API_ENDPOINTS.USERS.GET === 'function'
        ? API_ENDPOINTS.USERS.GET(userId)
        : `users/${userId}`;
      await mutate(userUrl);
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.USERS.LIST));

      toast.success('User removed from organization successfully');
      hackLog.dev('User removed from organization successfully', { userId, orgId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsRemovingFromOrg(false);
    }
  };

  return {
    updateUser,
    deleteUser,
    addToOrganization,
    removeFromOrganization,
    isUpdating,
    isDeleting,
    isAddingToOrg,
    isRemovingFromOrg
  };
}
