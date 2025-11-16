import { apiRequest } from '@/helpers/request';
import hackLog from '@/lib/logger';
import { API_ENDPOINTS } from '@/constants/api';
import { extractErrorMessage } from '@/helpers/errors';

// User API Types
export interface User {
  id: string;
  email: string;
  externalUserId: string;
  createdAt: string;
}

export interface UserWithOrganizations extends User {
  organizations: Array<{
    id: string;
    name: string;
    role: 'admin' | 'editor' | 'viewer';
    joinedAt: string;
  }>;
}

export interface UpdateUserRequest {
  email?: string;
}

export interface AddToOrganizationRequest {
  orgId: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Users API Service
export class UsersAPI {
  /**
   * Get paginated list of users
   */
  static async list(params?: { page?: number; limit?: number; orgId?: string }): Promise<UsersListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.orgId) queryParams.append('orgId', params.orgId);
      
      const url = `${API_ENDPOINTS.USERS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest.get<UsersListResponse>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        total: response.total,
        page: response.page,
        component: 'UsersAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.USERS.LIST, {
        error,
        params,
        component: 'UsersAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch users');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single user by ID
   */
  static async get(id: string): Promise<UserWithOrganizations> {
    try {
      const url = typeof API_ENDPOINTS.USERS.GET === 'function' 
        ? API_ENDPOINTS.USERS.GET(id) 
        : `users/${id}`;
      const response = await apiRequest.get<UserWithOrganizations>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        userId: id,
        hasOrganizations: !!response.organizations,
        component: 'UsersAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `users/${id}`, {
        error,
        userId: id,
        component: 'UsersAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch user');
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user
   */
  static async update(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const url = typeof API_ENDPOINTS.USERS.UPDATE === 'function' 
        ? API_ENDPOINTS.USERS.UPDATE(id) 
        : `users/${id}`;
      const response = await apiRequest.put<User>(url, data);
      
      hackLog.apiSuccess('PUT', url, {
        userId: id,
        component: 'UsersAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('PUT', `users/${id}`, {
        error,
        userId: id,
        data,
        component: 'UsersAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to update user');
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.USERS.DELETE === 'function' 
        ? API_ENDPOINTS.USERS.DELETE(id) 
        : `users/${id}`;
      await apiRequest.delete<void>(url);
      
      hackLog.apiSuccess('DELETE', url, {
        userId: id,
        component: 'UsersAPI'
      });
    } catch (error) {
      hackLog.apiError('DELETE', `users/${id}`, {
        error,
        userId: id,
        component: 'UsersAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to delete user');
      throw new Error(errorMessage);
    }
  }

  /**
   * Add user to organization
   */
  static async addToOrganization(userId: string, data: AddToOrganizationRequest): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.USERS.ADD_TO_ORG === 'function' 
        ? API_ENDPOINTS.USERS.ADD_TO_ORG(userId) 
        : `users/${userId}/organizations`;
      await apiRequest.post<void>(url, data);
      
      hackLog.apiSuccess('POST', url, {
        userId,
        orgId: data.orgId,
        role: data.role,
        component: 'UsersAPI'
      });
    } catch (error) {
      hackLog.apiError('POST', `users/${userId}/organizations`, {
        error,
        userId,
        data,
        component: 'UsersAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to add user to organization');
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove user from organization
   */
  static async removeFromOrganization(userId: string, orgId: string): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.USERS.REMOVE_FROM_ORG === 'function' 
        ? API_ENDPOINTS.USERS.REMOVE_FROM_ORG(userId, orgId) 
        : `users/${userId}/organizations/${orgId}`;
      await apiRequest.delete<void>(url);
      
      hackLog.apiSuccess('DELETE', url, {
        userId,
        orgId,
        component: 'UsersAPI'
      });
    } catch (error) {
      hackLog.apiError('DELETE', `users/${userId}/organizations/${orgId}`, {
        error,
        userId,
        orgId,
        component: 'UsersAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to remove user from organization');
      throw new Error(errorMessage);
    }
  }
}
