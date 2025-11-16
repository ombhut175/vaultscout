import { create } from 'zustand';
import hackLog from '@/lib/logger';
import { Group } from '@/lib/api/groups';

// Groups Store State Interface
interface GroupsState {
  // Selected group for detail view
  selectedGroup: Group | null;
  
  // Filters for group list
  filters: {
    orgId: string | null;
  };
  
  // UI state
  isGroupDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isAddMemberDialogOpen: boolean;

  // Actions
  setSelectedGroup: (group: Group | null) => void;
  setFilters: (filters: Partial<GroupsState['filters']>) => void;
  resetFilters: () => void;
  setOrgId: (orgId: string | null) => void;
  setGroupDialogOpen: (isOpen: boolean) => void;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  setAddMemberDialogOpen: (isOpen: boolean) => void;
}

/**
 * Groups Store - Client-side state management for groups
 * Following hackathon rules for simple, debuggable state management
 */
export const useGroupsStore = create<GroupsState>((set, get) => ({
  // Initial state
  selectedGroup: null,
  
  filters: {
    orgId: null
  },
  
  isGroupDialogOpen: false,
  isDeleteDialogOpen: false,
  isAddMemberDialogOpen: false,

  /**
   * Set selected group for detail view
   */
  setSelectedGroup: (group: Group | null) => {
    hackLog.storeAction('setSelectedGroup', {
      groupId: group?.id,
      groupName: group?.name,
      trigger: 'group_selection'
    });

    set({ selectedGroup: group });
  },

  /**
   * Update filters (partial update)
   */
  setFilters: (filters: Partial<GroupsState['filters']>) => {
    hackLog.storeAction('setFilters', {
      filters,
      previousFilters: get().filters,
      trigger: 'filter_change'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        ...filters
      }
    }));
  },

  /**
   * Reset filters to default
   */
  resetFilters: () => {
    hackLog.storeAction('resetFilters', {
      previousFilters: get().filters,
      trigger: 'filter_reset'
    });

    set({
      filters: {
        orgId: null
      }
    });
  },

  /**
   * Set organization filter
   */
  setOrgId: (orgId: string | null) => {
    hackLog.storeAction('setOrgId', {
      orgId,
      previousOrgId: get().filters.orgId,
      trigger: 'filter_change'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        orgId
      }
    }));
  },

  /**
   * Toggle group dialog (for create/edit)
   */
  setGroupDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setGroupDialogOpen', {
      isOpen,
      trigger: 'dialog_toggle'
    });

    set({ isGroupDialogOpen: isOpen });
  },

  /**
   * Toggle delete confirmation dialog
   */
  setDeleteDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setDeleteDialogOpen', {
      isOpen,
      groupId: get().selectedGroup?.id,
      trigger: 'dialog_toggle'
    });

    set({ isDeleteDialogOpen: isOpen });
  },

  /**
   * Toggle add member dialog
   */
  setAddMemberDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setAddMemberDialogOpen', {
      isOpen,
      groupId: get().selectedGroup?.id,
      trigger: 'dialog_toggle'
    });

    set({ isAddMemberDialogOpen: isOpen });
  }
}));

// Export selector hooks for easy access to specific store parts
export const useSelectedGroup = () => useGroupsStore(state => state.selectedGroup);
export const useGroupsFilters = () => useGroupsStore(state => state.filters);
export const useGroupsDialogs = () => useGroupsStore(state => ({
  isGroupDialogOpen: state.isGroupDialogOpen,
  isDeleteDialogOpen: state.isDeleteDialogOpen,
  isAddMemberDialogOpen: state.isAddMemberDialogOpen
}));
