import { useState } from 'react';
import { mutate } from 'swr';
import { DocumentsAPI, UploadDocumentRequest, UpdateDocumentRequest } from '@/lib/api/documents';
import { handleError } from '@/helpers/errors';
import { API_ENDPOINTS } from '@/constants/api';
import hackLog from '@/lib/logger';
import { toast } from 'sonner';

/**
 * Hook for document CRUD operations
 * Handles mutations and SWR cache revalidation
 */
export function useDocumentMutations() {
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload document
   */
  const uploadDocument = async (data: UploadDocumentRequest) => {
    hackLog.dev('uploadDocument called', { 
      title: data.title, 
      fileSize: data.file.size,
      tags: data.tags,
      groupIds: data.groupIds
    });
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (in real implementation, use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const newDocument = await DocumentsAPI.upload(data);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Revalidate SWR cache
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.DOCUMENTS.LIST));

      toast.success('Document uploaded successfully');
      hackLog.dev('Document uploaded successfully', { docId: newDocument.id });

      return newDocument;
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  /**
   * Update document
   */
  const updateDocument = async (docId: string, data: UpdateDocumentRequest) => {
    hackLog.dev('updateDocument called', { docId, data });
    setIsUpdating(true);

    try {
      const updatedDocument = await DocumentsAPI.update(docId, data);

      // Revalidate SWR cache
      const docUrl = typeof API_ENDPOINTS.DOCUMENTS.GET === 'function'
        ? API_ENDPOINTS.DOCUMENTS.GET(docId)
        : `documents/${docId}`;
      await mutate(docUrl);
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.DOCUMENTS.LIST));

      toast.success('Document updated successfully');
      hackLog.dev('Document updated successfully', { docId });

      return updatedDocument;
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete document
   */
  const deleteDocument = async (docId: string) => {
    hackLog.dev('deleteDocument called', { docId });
    setIsDeleting(true);

    try {
      await DocumentsAPI.delete(docId);

      // Revalidate SWR cache
      await mutate((key) => typeof key === 'string' && key.startsWith(API_ENDPOINTS.DOCUMENTS.LIST));

      toast.success('Document deleted successfully');
      hackLog.dev('Document deleted successfully', { docId });
    } catch (error) {
      handleError(error, { toast: true });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    uploadDocument,
    updateDocument,
    deleteDocument,
    isUploading,
    isUpdating,
    isDeleting,
    uploadProgress
  };
}
