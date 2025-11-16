import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { GroupWithMembers } from '@/lib/api/groups';

/**
 * Hook to fetch single group by ID with members
 * Uses SWR for caching and automatic revalidation
 */
export function useGroup(groupId: string | null) {
  const url = groupId && typeof API_ENDPOINTS.GROUPS.GET === 'function'
    ? API_ENDPOINTS.GROUPS.GET(groupId)
    : groupId
    ? `groups/${groupId}`
    : null;

  hackLog.dev('useGroup hook called', { groupId, url });

  const { data, error, isLoading, mutate } = useSWR<GroupWithMembers>(
    url,
    url ? (url: string) => swrFetcher<GroupWithMembers>(url) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    group: data || null,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
