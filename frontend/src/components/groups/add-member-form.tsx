'use client';

import { useState, useEffect } from 'react';
import { useGroupMutations } from '@/hooks/useGroupMutations';
import { useUsers } from '@/hooks/useUsers';
import { GroupWithMembers, GroupMember } from '@/lib/api/groups';
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
import { Loader2 } from 'lucide-react';
import hackLog from '@/lib/logger';

interface AddMemberFormProps {
  group: GroupWithMembers | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddMemberForm({ group, isOpen, onClose, onSuccess }: AddMemberFormProps) {
  const { addMember, isAddingMember } = useGroupMutations();
  const { users, isLoading: isLoadingUsers } = useUsers({
    orgId: group?.orgId,
    limit: 100, // Get more users for selection
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId('');
      setError('');
    }
  }, [isOpen]);

  // Filter out users who are already members
  const availableUsers = users.filter(
    (user) => !group?.members?.some((member: GroupMember) => member.id === user.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    hackLog.dev('AddMemberForm: Submit clicked', {
      groupId: group?.id,
      selectedUserId,
    });

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    if (!group) {
      setError('Group not found');
      return;
    }

    try {
      await addMember(group.id, { userId: selectedUserId });
      onSuccess?.();
      onClose();
    } catch (error) {
      hackLog.error('AddMemberForm: Submit failed', { error });
      // Error toast is handled by useGroupMutations
    }
  };

  const handleClose = () => {
    if (!isAddingMember) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member to Group</DialogTitle>
          <DialogDescription>
            Select a user to add to {group?.name || 'this group'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user">
                User <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isAddingMember || isLoadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>
                      Loading users...
                    </SelectItem>
                  ) : availableUsers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available users
                    </SelectItem>
                  ) : (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            {/* Current Members Info */}
            {group?.members && group.members.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Current members: {group.members.length}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isAddingMember}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAddingMember || isLoadingUsers}>
              {isAddingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
