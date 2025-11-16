import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { ChunksListResponse } from '@/lib/api/documents';

/**
 * Hook to fetch document chunks with pagination
 * Uses SWR for caching and automatic revalidation
 */
export function useDocumentChunks(docId: string | null, page: number = 1, limit: number = 20) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  const baseUrl = docId && typeof API_ENDPOINTS.DOCUMENTS.CHUNKS === 'function'
    ? API_ENDPOINTS.DOCUMENTS.CHUNKS(docId)
    : docId
    ? `documents/${docId}/chunks`
    : null;

  const url = baseUrl ? `${baseUrl}?${queryParams.toString()}` : null;

  hackLog.dev('useDocumentChunks hook called', { docId, page, limit, url });

  const { data, error, isLoading, mutate } = useSWR<ChunksListResponse>(
    url,
    url ? (url: string) => swrFetcher<ChunksListResponse>(url) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    chunks: data?.chunks || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
