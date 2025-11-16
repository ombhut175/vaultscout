import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { Organization } from '@/lib/api/organizations';

/**
 * Hook to fetch list of organizations for current user
 * Uses SWR for caching and automatic revalidation
 */
export function useOrganizations() {
  const url = API_ENDPOINTS.ORGANIZATIONS.LIST;

  hackLog.dev('useOrganizations hook called', { url });

  const { data, error, isLoading, mutate } = useSWR<Organization[]>(
    url,
    (url: string) => swrFetcher<Organization[]>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    organizations: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
