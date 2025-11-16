import { toast } from 'sonner';
import { Role } from '@/hooks/useAccessControl';
import hackLog from './logger';

/**
 * Permission utilities for access control
 */

/**
 * Check if user has required permission
 * Shows error toast if unauthorized
 */
export function checkPermission(
  userRole: Role | null,
  requiredRoles: Role[],
  action: string = 'perform this action'
): boolean {
  if (!userRole) {
    toast.error('Unauthorized', {
      description: 'You must be logged in to ' + action
    });
    
    hackLog.error('Permission check failed: No user role', {
      action,
      requiredRoles,
      component: 'PermissionUtils'
    });
    
    return false;
  }

  if (!requiredRoles.includes(userRole)) {
    toast.error('Insufficient Permissions', {
      description: `You need ${requiredRoles.join(' or ')} role to ${action}`
    });
    
    hackLog.error('Permission check failed: Insufficient role', {
      userRole,
      requiredRoles,
      action,
      component: 'PermissionUtils'
    });
    
    return false;
  }

  return true;
}

/**
 * Check if user can edit
 */
export function canEdit(userRole: Role | null): boolean {
  return userRole === 'admin' || userRole === 'editor';
}

/**
 * Check if user can delete
 */
export function canDelete(userRole: Role | null): boolean {
  return userRole === 'admin';
}

/**
 * Check if user can create
 */
export function canCreate(userRole: Role | null): boolean {
  return userRole === 'admin' || userRole === 'editor';
}

/**
 * Handle 403 Forbidden errors
 * Shows error toast and optionally redirects
 */
export function handle403Error(
  message: string = 'You do not have permission to access this resource',
  redirectTo?: string
) {
  toast.error('Access Denied', {
    description: message
  });

  hackLog.error('403 Forbidden', {
    message,
    redirectTo,
    component: 'PermissionUtils'
  });

  if (redirectTo) {
    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 1500);
  }
}

/**
 * Permission error messages
 */
export const PERMISSION_MESSAGES = {
  NO_ACCESS: 'You do not have permission to access this resource',
  ADMIN_ONLY: 'This action requires administrator privileges',
  EDITOR_REQUIRED: 'This action requires editor or administrator privileges',
  CANNOT_EDIT: 'You do not have permission to edit this resource',
  CANNOT_DELETE: 'You do not have permission to delete this resource',
  CANNOT_CREATE: 'You do not have permission to create this resource',
  LOGIN_REQUIRED: 'You must be logged in to perform this action'
} as const;

/**
 * Role display names
 */
export const ROLE_NAMES: Record<Role, string> = {
  admin: 'Administrator',
  editor: 'Editor',
  viewer: 'Viewer'
} as const;

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full access to manage organization, users, and content',
  editor: 'Can upload and manage documents',
  viewer: 'Can only view and search documents'
} as const;
