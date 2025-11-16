import { apiRequest } from '@/helpers/request';
import hackLog from '@/lib/logger';
import { API_ENDPOINTS } from '@/constants/api';
import { extractErrorMessage } from '@/helpers/errors';

// Group API Types
export interface Group {
  id: string;
  orgId: string;
  name: string;
  createdBy: string;
  createdAt: string;
  memberCount?: number;
}

export interface GroupMember {
  id: string;
  email: string;
  joinedAt: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
  orgId: string;
}

export interface UpdateGroupRequest {
  name?: string;
}

export interface AddMemberRequest {
  userId: string;
}

export interface GroupsListResponse {
  groups: Group[];
  total: number;
}

// Groups API Service
export class GroupsAPI {
  /**
   * Get list of groups
   */
  static async list(params?: { orgId?: string }): Promise<Group[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.orgId) queryParams.append('orgId', params.orgId);
      
      const url = `${API_ENDPOINTS.GROUPS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest.get<Group[]>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        count: response.length,
        component: 'GroupsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.GROUPS.LIST, {
        error,
        params,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch groups');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single group by ID
   */
  static async get(id: string): Promise<GroupWithMembers> {
    try {
      const url = typeof API_ENDPOINTS.GROUPS.GET === 'function' 
        ? API_ENDPOINTS.GROUPS.GET(id) 
        : `groups/${id}`;
      const response = await apiRequest.get<GroupWithMembers>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        groupId: id,
        memberCount: response.members?.length || 0,
        component: 'GroupsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `groups/${id}`, {
        error,
        groupId: id,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch group');
      throw new Error(errorMessage);
    }
  }

  /**
   * Create new group
   */
  static async create(data: CreateGroupRequest): Promise<Group> {
    try {
      const response = await apiRequest.post<Group>(API_ENDPOINTS.GROUPS.CREATE, data);
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.GROUPS.CREATE, {
        groupName: data.name,
        orgId: data.orgId,
        component: 'GroupsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.GROUPS.CREATE, {
        error,
        data,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to create group');
      throw new Error(errorMessage);
    }
  }

  /**
   * Update group
   */
  static async update(id: string, data: UpdateGroupRequest): Promise<Group> {
    try {
      const url = typeof API_ENDPOINTS.GROUPS.UPDATE === 'function' 
        ? API_ENDPOINTS.GROUPS.UPDATE(id) 
        : `groups/${id}`;
      const response = await apiRequest.put<Group>(url, data);
      
      hackLog.apiSuccess('PUT', url, {
        groupId: id,
        component: 'GroupsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('PUT', `groups/${id}`, {
        error,
        groupId: id,
        data,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to update group');
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete group
   */
  static async delete(id: string): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.GROUPS.DELETE === 'function' 
        ? API_ENDPOINTS.GROUPS.DELETE(id) 
        : `groups/${id}`;
      await apiRequest.delete<void>(url);
      
      hackLog.apiSuccess('DELETE', url, {
        groupId: id,
        component: 'GroupsAPI'
      });
    } catch (error) {
      hackLog.apiError('DELETE', `groups/${id}`, {
        error,
        groupId: id,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to delete group');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get group members
   */
  static async getMembers(id: string, params?: { page?: number; limit?: number }): Promise<{ members: GroupMember[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const baseUrl = typeof API_ENDPOINTS.GROUPS.MEMBERS === 'function' 
        ? API_ENDPOINTS.GROUPS.MEMBERS(id) 
        : `groups/${id}/members`;
      const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest.get<{ members: GroupMember[]; total: number }>(url, false);
      
      hackLog.apiSuccess('GET', url, {
        groupId: id,
        memberCount: response.members.length,
        component: 'GroupsAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', `groups/${id}/members`, {
        error,
        groupId: id,
        params,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch group members');
      throw new Error(errorMessage);
    }
  }

  /**
   * Add member to group
   */
  static async addMember(groupId: string, data: AddMemberRequest): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.GROUPS.ADD_MEMBER === 'function' 
        ? API_ENDPOINTS.GROUPS.ADD_MEMBER(groupId) 
        : `groups/${groupId}/members`;
      await apiRequest.post<void>(url, data);
      
      hackLog.apiSuccess('POST', url, {
        groupId,
        userId: data.userId,
        component: 'GroupsAPI'
      });
    } catch (error) {
      hackLog.apiError('POST', `groups/${groupId}/members`, {
        error,
        groupId,
        data,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to add member to group');
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove member from group
   */
  static async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      const url = typeof API_ENDPOINTS.GROUPS.REMOVE_MEMBER === 'function' 
        ? API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId) 
        : `groups/${groupId}/members/${userId}`;
      await apiRequest.delete<void>(url);
      
      hackLog.apiSuccess('DELETE', url, {
        groupId,
        userId,
        component: 'GroupsAPI'
      });
    } catch (error) {
      hackLog.apiError('DELETE', `groups/${groupId}/members/${userId}`, {
        error,
        groupId,
        userId,
        component: 'GroupsAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to remove member from group');
      throw new Error(errorMessage);
    }
  }
}
