'use client';

// Permission guard component for protecting UI elements
import { ReactNode } from 'react';
import { Role } from '@/hooks/useAccessControl';
import { checkPermission, PERMISSION_MESSAGES } from '@/lib/permission-utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PermissionGuardProps {
  children: ReactNode;
  userRole: Role | null;
  requiredRoles: Role[];
  action?: string;
  fallback?: ReactNode;
  showError?: boolean;
}

export function PermissionGuard({
  children,
  userRole,
  requiredRoles,
  action = 'access this content',
  fallback,
  showError = false,
}: PermissionGuardProps) {
  const hasPermission = checkPermission(userRole, requiredRoles, action);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            {PERMISSION_MESSAGES.NO_ACCESS}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

// Simplified permission check for conditional rendering
interface CanProps {
  userRole: Role | null;
  requiredRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ userRole, requiredRoles, children, fallback }: CanProps) {
  if (!userRole || !requiredRoles.includes(userRole)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
