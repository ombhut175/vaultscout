import { useMemo } from 'react';
import { useAuthUser } from './use-auth-store';
import { useUser } from './useUser';
import hackLog from '@/lib/logger';

export type Role = 'admin' | 'editor' | 'viewer';

interface AccessControlReturn {
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canView: boolean;
}

/**
 * Hook for checking user's access control permissions
 * Checks user's role in their organizations
 */
export function useAccessControl(): AccessControlReturn {
  const authUser = useAuthUser();
  const { user: userDetails } = useUser(authUser?.id || null);

  // Determine user's highest role across all organizations
  const userRole = useMemo(() => {
    if (!userDetails?.organizations || userDetails.organizations.length === 0) {
      return 'viewer' as Role;
    }

    // Admin takes precedence, then editor, then viewer
    const roles = userDetails.organizations.map(org => org.role);
    
    if (roles.includes('admin')) return 'admin' as Role;
    if (roles.includes('editor')) return 'editor' as Role;
    return 'viewer' as Role;
  }, [userDetails]);

  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor';
  const isViewer = userRole === 'viewer';

  const hasRole = (role: Role) => userRole === role;
  
  const hasAnyRole = (roles: Role[]) => roles.includes(userRole);

  // Permission checks
  const canEdit = isAdmin || isEditor;
  const canDelete = isAdmin;
  const canCreate = isAdmin || isEditor;
  const canView = true; // All authenticated users can view

  hackLog.dev('useAccessControl', {
    userId: authUser?.id,
    userRole,
    isAdmin,
    isEditor,
    isViewer,
    canEdit,
    canDelete,
    canCreate
  });

  return {
    isAdmin,
    isEditor,
    isViewer,
    hasRole,
    hasAnyRole,
    canEdit,
    canDelete,
    canCreate,
    canView
  };
}

/**
 * Hook for checking permissions in a specific organization
 */
export function useOrganizationAccessControl(orgId: string | null): AccessControlReturn & { role: Role | null } {
  const authUser = useAuthUser();
  const { user: userDetails } = useUser(authUser?.id || null);

  const orgRole = useMemo(() => {
    if (!orgId || !userDetails?.organizations) {
      return null;
    }

    const org = userDetails.organizations.find(o => o.id === orgId);
    return org?.role || null;
  }, [orgId, userDetails]);

  const isAdmin = orgRole === 'admin';
  const isEditor = orgRole === 'editor';
  const isViewer = orgRole === 'viewer';

  const hasRole = (role: Role) => orgRole === role;
  
  const hasAnyRole = (roles: Role[]) => orgRole ? roles.includes(orgRole) : false;

  const canEdit = isAdmin || isEditor;
  const canDelete = isAdmin;
  const canCreate = isAdmin || isEditor;
  const canView = !!orgRole;

  return {
    role: orgRole,
    isAdmin,
    isEditor,
    isViewer,
    hasRole,
    hasAnyRole,
    canEdit,
    canDelete,
    canCreate,
    canView
  };
}

/**
 * Hook for checking if user belongs to specific groups
 * Used for document ACL checks
 */
export function useGroupMembership(groupIds: string[]): {
  isMember: boolean;
  memberGroups: string[];
  hasAccessToAny: boolean;
} {
  const authUser = useAuthUser();
  const { user: userDetails } = useUser(authUser?.id || null);

  const result = useMemo(() => {
    if (!userDetails || groupIds.length === 0) {
      return {
        isMember: false,
        memberGroups: [],
        hasAccessToAny: false
      };
    }

    // This would need to be implemented with actual group membership data
    // For now, returning a placeholder
    // TODO: Implement actual group membership check when groups API is available
    
    return {
      isMember: false,
      memberGroups: [],
      hasAccessToAny: false
    };
  }, [userDetails, groupIds]);

  return result;
}
