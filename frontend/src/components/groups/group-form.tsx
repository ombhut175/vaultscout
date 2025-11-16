'use client';

import { useState, useEffect } from 'react';
import { useGroupMutations } from '@/hooks/useGroupMutations';
import { Group } from '@/lib/api/groups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import hackLog from '@/lib/logger';

interface GroupFormProps {
  group?: Group | null;
  orgId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GroupForm({ group, orgId, isOpen, onClose, onSuccess }: GroupFormProps) {
  const { createGroup, updateGroup, isCreating, isUpdating } = useGroupMutations();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; orgId?: string }>({});

  const isEditMode = !!group;
  const isLoading = isCreating || isUpdating;

  // Reset form when dialog opens/closes or group changes
  useEffect(() => {
    if (isOpen) {
      setName(group?.name || '');
      setErrors({});
    }
  }, [isOpen, group]);

  const validateForm = () => {
    const newErrors: { name?: string; orgId?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Group name must be at least 2 characters';
    }

    if (!isEditMode && !orgId) {
      newErrors.orgId = 'Organization ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    hackLog.dev('GroupForm: Submit clicked', {
      isEditMode,
      groupId: group?.id,
      name,
      orgId,
    });

    if (!validateForm()) {
      hackLog.dev('GroupForm: Validation failed', { errors });
      return;
    }

    try {
      if (isEditMode && group) {
        await updateGroup(group.id, { name: name.trim() });
      } else if (orgId) {
        await createGroup({ name: name.trim(), orgId });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      hackLog.error('GroupForm: Submit failed', { error, isEditMode });
      // Error toast is handled by useGroupMutations
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Group' : 'Create Group'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the group name below.'
              : 'Create a new group to organize users and control document access.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Group Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Engineering Team"
                disabled={isLoading}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Organization ID (display only in edit mode) */}
            {isEditMode && group && (
              <div className="space-y-2">
                <Label>Organization ID</Label>
                <Input value={group.orgId} disabled />
              </div>
            )}

            {/* Organization ID error (create mode) */}
            {!isEditMode && errors.orgId && (
              <p className="text-sm text-destructive">{errors.orgId}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
