import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { Group } from '@/lib/api/groups';
import { useMemo } from 'react';

interface UseGroupsOptions {
  orgId?: string;
  userId?: string;
}

/**
 * Hook to fetch list of groups
 * Uses SWR for caching and automatic revalidation
 * 
 * Note: userId filtering is done client-side for now.
 * If backend implements userId query parameter (task 43.2),
 * this will automatically use server-side filtering.
 */
export function useGroups(options: UseGroupsOptions = {}) {
  const { orgId, userId } = options;

  // Build query params
  const queryParams = new URLSearchParams();
  if (orgId) queryParams.append('orgId', orgId);
  // If backend supports userId filtering (task 43.2), add it here
  // For now, we'll filter client-side
  // if (userId) queryParams.append('userId', userId);

  const url = `${API_ENDPOINTS.GROUPS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  hackLog.dev('useGroups hook called', { orgId, userId, url });

  const { data, error, isLoading, mutate } = useSWR<Group[]>(
    url,
    (url: string) => swrFetcher<Group[]>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  // Filter groups by userId if provided (client-side filtering)
  const filteredGroups = useMemo(() => {
    if (!data) return [];
    if (!userId) return data;
    
    // Filter groups where the user is a member
    // Note: This assumes the Group type has a members array
    // If not available, this will return all groups
    return data.filter(group => {
      // Check if group has members array and user is in it
      if ('members' in group && Array.isArray((group as any).members)) {
        return (group as any).members.some((member: any) => 
          member.id === userId || member.userId === userId
        );
      }
      // If no members data, return all groups (fallback)
      return true;
    });
  }, [data, userId]);

  return {
    groups: filteredGroups,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
