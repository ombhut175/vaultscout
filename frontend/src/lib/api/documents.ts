import { apiRequest } from '@/helpers/request';
import hackLog from '@/lib/logger';
import { API_ENDPOINTS } from '@/constants/api';
import { extractErrorMessage } from '@/helpers/errors';

// Document API Types
export interface Document {
  id: string;
  orgId: string;
  createdBy: string;
  title: string;
  fileType: string;
  tags: string[];
  status: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  sectionTitle: string;
  page: number;
  position: number;
  text: string;
  tokenCount: number;
  createdAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  notes: string;
  createdAt: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  tags?: string[];
}

export interface UploadDocumentRequest {
  file: File;
  title: string;
  tags?: string[];
  groupIds?: string[];
}

export interface DocumentsListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChunksListResponse {
  chunks: DocumentChunk[];
  total: number;
  page: number;
  limit: number;
}

// Documents API Service
export class DocumentsAPI {
  /**
   * Get paginated list of documents
   */
  static async list(params?: { 
    page?: number; 
    limit?: number; 
    orgId?: string;
    status?: string;
    fileType?: string;
    tags?: string[];
  }): Promise<DocumentsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.orgId) queryParams.append('orgId', params.orgId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.fileType) queryParams.append('fileType', params.fileType);
      if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
      
      const url = `${API_ENDPOINTS.DOCUMENTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest.get<DocumentsListResponse>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        total: response.total,
        page: response.page,
        component: 'DocumentsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.DOCUMENTS.LIST, {
        error,
        params,
        component: 'DocumentsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch documents');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single document by ID
   */
  static async get(id: string): Promise<Document> {
    try {
      const url = typeof API_ENDPOINTS.DOCUMENTS.GET === 'function' 
        ? API_ENDPOINTS.DOCUMENTS.GET(id) 
        : `documents/${id}`;
      const response = await apiRequest.get<Document>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        documentId: id,
        status: response.status,
        component: 'DocumentsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `documents/${id}`, {
        error,
        documentId: id,
        component: 'DocumentsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch document');
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload new document
   */
  static async upload(data: UploadDocumentRequest): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      if (data.tags) {
        data.tags.forEach(tag => formData.append('tags', tag));
      }
      if (data.groupIds) {
        data.groupIds.forEach(groupId => formData.append('groupIds', groupId));
      }
      
      const response = await apiRequest.post<Document>(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData);
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.DOCUMENTS.UPLOAD, {
        title: data.title,
        fileSize: data.file.size,
        component: 'DocumentsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.DOCUMENTS.UPLOAD, {
        error,
        title: data.title,
        component: 'DocumentsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to upload document');
      throw new Error(errorMessage);
    }
  }

  /**
   * Update document
   */
  static async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
    try {
      const url = typeof API_ENDPOINTS.DOCUMENTS.UPDATE === 'function' 
        ? API_ENDPOINTS.DOCUMENTS.UPDATE(id) 
        : `documents/${id}`;
      const response = await apiRequest.put<Document>(url, data);
      
      hackLog.apiSuccess('PUT', url, {
        documentId: id,
        component: 'DocumentsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('PUT', `documents/${id}`, {
        error,
        documentId: id,
        data,
        component: 'DocumentsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to update document');
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete document
   */
  static async delete(id: string): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.DOCUMENTS.DELETE === 'function' 
        ? API_ENDPOINTS.DOCUMENTS.DELETE(id) 
        : `documents/${id}`;
      await apiRequest.delete<void>(url);
      
      hackLog.apiSuccess('DELETE', url, {
        documentId: id,
        component: 'DocumentsAPI'
      });
    } catch (error) {
      hackLog.apiError('DELETE', `documents/${id}`, {
        error,
        documentId: id,
        component: 'DocumentsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to delete document');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get document chunks
   */
  static async getChunks(id: string, params?: { page?: number; limit?: number }): Promise<ChunksListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const baseUrl = typeof API_ENDPOINTS.DOCUMENTS.CHUNKS === 'function' 
        ? API_ENDPOINTS.DOCUMENTS.CHUNKS(id) 
        : `documents/${id}/chunks`;
      const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest.get<ChunksListResponse>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        documentId: id,
        chunkCount: response.chunks.length,
        component: 'DocumentsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `documents/${id}/chunks`, {
        error,
        documentId: id,
        params,
        component: 'DocumentsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch document chunks');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get document versions
   */
  static async getVersions(id: string): Promise<DocumentVersion[]> {
    try {
      const url = typeof API_ENDPOINTS.DOCUMENTS.VERSIONS === 'function' 
        ? API_ENDPOINTS.DOCUMENTS.VERSIONS(id) 
        : `documents/${id}/versions`;
      const response = await apiRequest.get<DocumentVersion[]>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        documentId: id,
        versionCount: response.length,
        component: 'DocumentsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `documents/${id}/versions`, {
        error,
        documentId: id,
        component: 'DocumentsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch document versions');
      throw new Error(errorMessage);
    }
  }
}
