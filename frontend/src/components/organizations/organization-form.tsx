'use client';

import { useState, useEffect } from 'react';
import { Organization } from '@/lib/api/organizations';
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
import { useOrganizationMutations } from '@/hooks/useOrganizationMutations';
import { Loader2 } from 'lucide-react';
import hackLog from '@/lib/logger';

interface OrganizationFormProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function OrganizationForm({ 
  organization, 
  open, 
  onOpenChange, 
  onSuccess 
}: OrganizationFormProps) {
  const { createOrganization, updateOrganization, isCreating, isUpdating } = useOrganizationMutations();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEditMode = !!organization;
  const isLoading = isCreating || isUpdating;

  hackLog.dev('OrganizationForm: Rendering', { 
    orgId: organization?.id, 
    isEditMode, 
    open 
  });

  // Update form when organization changes
  useEffect(() => {
    if (organization) {
      setName(organization.name);
    } else {
      setName('');
    }
  }, [organization]);

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Organization name must be at least 3 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Organization name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && organization) {
        await updateOrganization(organization.id, { name: name.trim() });
      } else {
        await createOrganization({ name: name.trim() });
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      hackLog.error('OrganizationForm: Failed to save organization', { 
        error, 
        orgId: organization?.id,
        isEditMode 
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName(organization?.name || '');
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Organization' : 'Create Organization'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update organization information. Changes will be saved immediately.'
              : 'Create a new organization. A Pinecone namespace will be automatically assigned.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                disabled={isLoading}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
