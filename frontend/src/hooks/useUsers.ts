import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { UsersListResponse } from '@/lib/api/users';

interface UseUsersOptions {
  page?: number;
  limit?: number;
  orgId?: string;
}

/**
 * Hook to fetch paginated list of users
 * Uses SWR for caching and automatic revalidation
 */
export function useUsers(options: UseUsersOptions = {}) {
  const { page = 1, limit = 20, orgId } = options;

  // Build query params
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (orgId) queryParams.append('orgId', orgId);

  const url = `${API_ENDPOINTS.USERS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  hackLog.dev('useUsers hook called', { page, limit, orgId, url });

  const { data, error, isLoading, mutate } = useSWR<UsersListResponse>(
    url,
    (url: string) => swrFetcher<UsersListResponse>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    users: data?.users || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
