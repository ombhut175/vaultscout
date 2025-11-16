import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { OrganizationWithStats } from '@/lib/api/organizations';

/**
 * Hook to fetch single organization by ID with stats
 * Uses SWR for caching and automatic revalidation
 */
export function useOrganization(orgId: string | null) {
  const url = orgId && typeof API_ENDPOINTS.ORGANIZATIONS.GET === 'function'
    ? API_ENDPOINTS.ORGANIZATIONS.GET(orgId)
    : orgId
    ? `organizations/${orgId}`
    : null;

  hackLog.dev('useOrganization hook called', { orgId, url });

  const { data, error, isLoading, mutate } = useSWR<OrganizationWithStats>(
    url,
    url ? (url: string) => swrFetcher<OrganizationWithStats>(url) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    organization: data || null,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
