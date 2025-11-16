import { ReactNode } from 'react';
import { useAccessControl, Role } from '@/hooks/useAccessControl';
import hackLog from '@/lib/logger';

interface RoleGuardProps {
  children: ReactNode;
  roles?: Role[];
  requireAll?: boolean;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

/**
 * Component for role-based rendering
 * Shows children only if user has required role(s)
 * 
 * @example
 * <RoleGuard roles={['admin']}>
 *   <AdminOnlyButton />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  roles = [],
  requireAll = false,
  fallback = null,
  onUnauthorized
}: RoleGuardProps) {
  const { hasAnyRole, hasRole } = useAccessControl();

  // If no roles specified, show children (no restriction)
  if (roles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required role(s)
  const hasAccess = requireAll
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles);

  if (!hasAccess) {
    hackLog.dev('RoleGuard: Access denied', {
      requiredRoles: roles,
      requireAll,
      component: 'RoleGuard'
    });

    onUnauthorized?.();
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component for admin-only content
 */
export function AdminOnly({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard roles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Component for editor and admin content
 */
export function EditorOrAdmin({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard roles={['admin', 'editor']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Component for hiding content from viewers
 */
export function NotViewer({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard roles={['admin', 'editor']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
