import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { Document } from '@/lib/api/documents';

/**
 * Hook to fetch single document by ID
 * Uses SWR for caching and automatic revalidation
 */
export function useDocument(docId: string | null) {
  const url = docId && typeof API_ENDPOINTS.DOCUMENTS.GET === 'function'
    ? API_ENDPOINTS.DOCUMENTS.GET(docId)
    : docId
    ? `documents/${docId}`
    : null;

  hackLog.dev('useDocument hook called', { docId, url });

  const { data, error, isLoading, mutate } = useSWR<Document>(
    url,
    url ? (url: string) => swrFetcher<Document>(url) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    document: data || null,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
