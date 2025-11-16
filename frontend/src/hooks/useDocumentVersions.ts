import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { DocumentVersion } from '@/lib/api/documents';

/**
 * Hook to fetch document versions
 * Uses SWR for caching and automatic revalidation
 */
export function useDocumentVersions(docId: string | null) {
  const url = docId && typeof API_ENDPOINTS.DOCUMENTS.VERSIONS === 'function'
    ? API_ENDPOINTS.DOCUMENTS.VERSIONS(docId)
    : docId
    ? `documents/${docId}/versions`
    : null;

  hackLog.dev('useDocumentVersions hook called', { docId, url });

  const { data, error, isLoading, mutate } = useSWR<DocumentVersion[]>(
    url,
    url ? (url: string) => swrFetcher<DocumentVersion[]>(url) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    versions: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
