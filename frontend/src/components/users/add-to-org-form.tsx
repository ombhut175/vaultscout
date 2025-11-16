'use client';

import { useState } from 'react';
import { User } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserMutations } from '@/hooks/useUserMutations';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Loader2 } from 'lucide-react';
import hackLog from '@/lib/logger';

interface AddToOrgFormProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddToOrgForm({ user, open, onOpenChange, onSuccess }: AddToOrgFormProps) {
  const { addToOrganization, isAddingToOrg } = useUserMutations();
  const { organizations, isLoading: isLoadingOrgs } = useOrganizations();
  
  const [orgId, setOrgId] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [errors, setErrors] = useState<{ orgId?: string; role?: string }>({});

  hackLog.dev('AddToOrgForm: Rendering', { userId: user?.id, open });

  const validateForm = () => {
    const newErrors: { orgId?: string; role?: string } = {};

    if (!orgId) {
      newErrors.orgId = 'Organization is required';
    }

    if (!role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    try {
      await addToOrganization(user.id, { orgId, role });
      onSuccess?.();
      onOpenChange(false);
      // Reset form
      setOrgId('');
      setRole('viewer');
    } catch (error) {
      hackLog.error('AddToOrgForm: Failed to add user to organization', {
        error,
        userId: user.id,
        orgId,
        role,
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOrgId('');
      setRole('viewer');
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User to Organization</DialogTitle>
          <DialogDescription>
            Add {user?.email} to an organization with a specific role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Organization Select */}
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                value={orgId}
                onValueChange={(value) => {
                  setOrgId(value);
                  if (errors.orgId) {
                    setErrors({ ...errors, orgId: undefined });
                  }
                }}
                disabled={isAddingToOrg || isLoadingOrgs}
              >
                <SelectTrigger id="organization" className={errors.orgId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingOrgs ? (
                    <SelectItem value="loading" disabled>
                      Loading organizations...
                    </SelectItem>
                  ) : organizations.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No organizations available
                    </SelectItem>
                  ) : (
                    organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.orgId && (
                <p className="text-sm text-destructive">{errors.orgId}</p>
              )}
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value: 'admin' | 'editor' | 'viewer') => {
                  setRole(value);
                  if (errors.role) {
                    setErrors({ ...errors, role: undefined });
                  }
                }}
                disabled={isAddingToOrg}
              >
                <SelectTrigger id="role" className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {role === 'admin' && 'Full access to manage organization, users, and content'}
                {role === 'editor' && 'Can upload and manage documents'}
                {role === 'viewer' && 'Can only view and search documents'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isAddingToOrg}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAddingToOrg || isLoadingOrgs}>
              {isAddingToOrg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
