import { useState } from 'react';
import { mutate } from 'swr';
import { GroupsAPI, CreateGroupRequest, UpdateGroupRequest, AddMemberRequest } from '@/lib/api/groups';
import { handleError } from '@/helpers/errors';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { toast } from 'sonner';

/**
 * Hook for group CRUD operations
 * Handles mutations and SWR cache revalidation
 */
export function useGroupMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  /**
   * Create group
   */
  const createGroup = async (data: CreateGroupRequest) => {
    hackLog.dev('createGroup called', { data });
    setIsCreating(true);

    try {
      const newGroup = await GroupsAPI.create(data);

      // Revalidate SWR cache
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.GROUPS.LIST));

      toast.success('Group created successfully');
      hackLog.dev('Group created successfully', { groupId: newGroup.id });

      return newGroup;
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update group
   */
  const updateGroup = async (groupId: string, data: UpdateGroupRequest) => {
    hackLog.dev('updateGroup called', { groupId, data });
    setIsUpdating(true);

    try {
      const updatedGroup = await GroupsAPI.update(groupId, data);

      // Revalidate SWR cache
      const groupUrl = typeof API_ENDPOINTS.GROUPS.GET === 'function'
        ? API_ENDPOINTS.GROUPS.GET(groupId)
        : `groups/${groupId}`;
      await mutate(groupUrl);
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.GROUPS.LIST));

      toast.success('Group updated successfully');
      hackLog.dev('Group updated successfully', { groupId });

      return updatedGroup;
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete group
   */
  const deleteGroup = async (groupId: string) => {
    hackLog.dev('deleteGroup called', { groupId });
    setIsDeleting(true);

    try {
      await GroupsAPI.delete(groupId);

      // Revalidate SWR cache
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.GROUPS.LIST));

      toast.success('Group deleted successfully');
      hackLog.dev('Group deleted successfully', { groupId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Add member to group
   */
  const addMember = async (groupId: string, data: AddMemberRequest) => {
    hackLog.dev('addMember called', { groupId, data });
    setIsAddingMember(true);

    try {
      await GroupsAPI.addMember(groupId, data);

      // Revalidate SWR cache
      const groupUrl = typeof API_ENDPOINTS.GROUPS.GET === 'function'
        ? API_ENDPOINTS.GROUPS.GET(groupId)
        : `groups/${groupId}`;
      await mutate(groupUrl);
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.GROUPS.LIST));

      toast.success('Member added to group successfully');
      hackLog.dev('Member added to group successfully', { groupId, userId: data.userId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsAddingMember(false);
    }
  };

  /**
   * Remove member from group
   */
  const removeMember = async (groupId: string, userId: string) => {
    hackLog.dev('removeMember called', { groupId, userId });
    setIsRemovingMember(true);

    try {
      await GroupsAPI.removeMember(groupId, userId);

      // Revalidate SWR cache
      const groupUrl = typeof API_ENDPOINTS.GROUPS.GET === 'function'
        ? API_ENDPOINTS.GROUPS.GET(groupId)
        : `groups/${groupId}`;
      await mutate(groupUrl);
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.GROUPS.LIST));

      toast.success('Member removed from group successfully');
      hackLog.dev('Member removed from group successfully', { groupId, userId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsRemovingMember(false);
    }
  };

  return {
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    isCreating,
    isUpdating,
    isDeleting,
    isAddingMember,
    isRemovingMember
  };
}
