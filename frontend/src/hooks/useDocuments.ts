import useSWR from 'swr';
import { swrFetcher } from '@/helpers/request';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { DocumentsListResponse } from '@/lib/api/documents';
import { useDebounce } from './useDebounce';

interface UseDocumentsOptions {
  page?: number;
  limit?: number;
  orgId?: string;
  status?: string;
  fileType?: string;
  tags?: string[];
  searchTerm?: string;
}

/**
 * Hook to fetch paginated list of documents with filters
 * Uses SWR for caching and automatic revalidation
 * Implements 300ms debouncing for search term
 */
export function useDocuments(options: UseDocumentsOptions = {}) {
  const { page = 1, limit = 20, orgId, status, fileType, tags, searchTerm = '' } = options;

  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build query params
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (orgId) queryParams.append('orgId', orgId);
  if (status) queryParams.append('status', status);
  if (fileType) queryParams.append('fileType', fileType);
  if (tags && tags.length > 0) {
    tags.forEach(tag => queryParams.append('tags', tag));
  }
  if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);

  const url = `${API_ENDPOINTS.DOCUMENTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  hackLog.dev('useDocuments hook called', { 
    page, 
    limit, 
    orgId, 
    status, 
    fileType, 
    tags, 
    searchTerm: debouncedSearchTerm,
    url 
  });

  const { data, error, isLoading, mutate } = useSWR<DocumentsListResponse>(
    url,
    (url: string) => swrFetcher<DocumentsListResponse>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    documents: data?.documents || [],
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
