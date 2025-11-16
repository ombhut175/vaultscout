// Hook for checking ACL (Access Control List) permissions
import { useCallback } from 'react';
import { toast } from 'sonner';
import hackLog from '@/lib/logger';

interface ACLCheckOptions {
  userGroups: string[];
  requiredGroups: string[];
  resourceType?: string;
  resourceId?: string;
}

export function useACLCheck() {
  const checkACL = useCallback((options: ACLCheckOptions): boolean => {
    const { userGroups, requiredGroups, resourceType = 'resource', resourceId } = options;

    hackLog.dev('ACL Check', {
      userGroups,
      requiredGroups,
      resourceType,
      resourceId,
    });

    // If no groups are required, allow access
    if (!requiredGroups || requiredGroups.length === 0) {
      return true;
    }

    // Check if user belongs to at least one required group
    const hasAccess = requiredGroups.some((groupId) => userGroups.includes(groupId));

    if (!hasAccess) {
      hackLog.warn('ACL Check Failed', {
        userGroups,
        requiredGroups,
        resourceType,
        resourceId,
      });

      toast.error('Access Denied', {
        description: `You don't have access to this ${resourceType}. Contact your administrator to request access.`,
      });
    }

    return hasAccess;
  }, []);

  const checkDocumentACL = useCallback(
    (userGroups: string[], documentGroups: string[], documentId?: string): boolean => {
      return checkACL({
        userGroups,
        requiredGroups: documentGroups,
        resourceType: 'document',
        resourceId: documentId,
      });
    },
    [checkACL]
  );

  return {
    checkACL,
    checkDocumentACL,
  };
}
