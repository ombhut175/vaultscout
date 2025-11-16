import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { UserWithOrganizations } from '@/lib/api/users';

/**
 * Hook to fetch single user by ID with organizations
 * Uses SWR for caching and automatic revalidation
 */
export function useUser(userId: string | null) {
  const url = userId && typeof API_ENDPOINTS.USERS.GET === 'function'
    ? API_ENDPOINTS.USERS.GET(userId)
    : userId
    ? `users/${userId}`
    : null;

  hackLog.dev('useUser hook called', { userId, url });

  const { data, error, isLoading, mutate } = useSWR<UserWithOrganizations>(
    url,
    url ? (url: string) => swrFetcher<UserWithOrganizations>(url) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    user: data || null,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
