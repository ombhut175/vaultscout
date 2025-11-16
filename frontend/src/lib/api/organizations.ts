import { apiRequest } from '@/helpers/request';
import hackLog from '@/lib/logger';
import { API_ENDPOINTS } from '@/constants/api';
import { extractErrorMessage } from '@/helpers/errors';

// Organization API Types
export interface Organization {
  id: string;
  name: string;
  pineconeNamespace: string;
  createdBy: string;
  createdAt: string;
}

export interface OrganizationWithStats extends Organization {
  stats: {
    totalUsers: number;
    totalGroups: number;
    totalDocuments: number;
    storageUsed: number;
  };
}

export interface CreateOrganizationRequest {
  name: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
}

export interface OrganizationStats {
  totalUsers: number;
  totalGroups: number;
  totalDocuments: number;
  storageUsed: number;
}

// Organizations API Service
export class OrganizationsAPI {
  /**
   * Get list of organizations for current user
   */
  static async list(): Promise<Organization[]> {
    try {
      const response = await apiRequest.get<Organization[]>(API_ENDPOINTS.ORGANIZATIONS.LIST, false);
      
      hackLog.apiSuccess('GET', API_ENDPOINTS.ORGANIZATIONS.LIST, {
        count: response.length,
        component: 'OrganizationsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.ORGANIZATIONS.LIST, {
        error,
        component: 'OrganizationsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch organizations');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single organization by ID
   */
  static async get(id: string): Promise<OrganizationWithStats> {
    try {
      const url = typeof API_ENDPOINTS.ORGANIZATIONS.GET === 'function' 
        ? API_ENDPOINTS.ORGANIZATIONS.GET(id) 
        : `organizations/${id}`;
      const response = await apiRequest.get<OrganizationWithStats>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        orgId: id,
        hasStats: !!response.stats,
        component: 'OrganizationsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `organizations/${id}`, {
        error,
        orgId: id,
        component: 'OrganizationsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch organization');
      throw new Error(errorMessage);
    }
  }

  /**
   * Create new organization
   */
  static async create(data: CreateOrganizationRequest): Promise<Organization> {
    try {
      const response = await apiRequest.post<Organization>(API_ENDPOINTS.ORGANIZATIONS.CREATE, data);
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.ORGANIZATIONS.CREATE, {
        orgName: data.name,
        component: 'OrganizationsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.ORGANIZATIONS.CREATE, {
        error,
        data,
        component: 'OrganizationsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to create organization');
      throw new Error(errorMessage);
    }
  }

  /**
   * Update organization
   */
  static async update(id: string, data: UpdateOrganizationRequest): Promise<Organization> {
    try {
      const url = typeof API_ENDPOINTS.ORGANIZATIONS.UPDATE === 'function' 
        ? API_ENDPOINTS.ORGANIZATIONS.UPDATE(id) 
        : `organizations/${id}`;
      const response = await apiRequest.put<Organization>(url, data);
      
      hackLog.apiSuccess('PUT', url, {
        orgId: id,
        component: 'OrganizationsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('PUT', `organizations/${id}`, {
        error,
        orgId: id,
        data,
        component: 'OrganizationsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to update organization');
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete organization
   */
  static async delete(id: string): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.ORGANIZATIONS.DELETE === 'function' 
        ? API_ENDPOINTS.ORGANIZATIONS.DELETE(id) 
        : `organizations/${id}`;
      await apiRequest.delete<void>(url);
      
      hackLog.apiSuccess('DELETE', url, {
        orgId: id,
        component: 'OrganizationsAPI'
      });
    } catch (error) {
      hackLog.apiError('DELETE', `organizations/${id}`, {
        error,
        orgId: id,
        component: 'OrganizationsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to delete organization');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get organization statistics
   */
  static async getStats(id: string): Promise<OrganizationStats> {
    try {
      const url = typeof API_ENDPOINTS.ORGANIZATIONS.STATS === 'function' 
        ? API_ENDPOINTS.ORGANIZATIONS.STATS(id) 
        : `organizations/${id}/stats`;
      const response = await apiRequest.get<OrganizationStats>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        orgId: id,
        stats: response,
        component: 'OrganizationsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `organizations/${id}/stats`, {
        error,
        orgId: id,
        component: 'OrganizationsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch organization stats');
      throw new Error(errorMessage);
    }
  }
}
