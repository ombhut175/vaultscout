import { create } from 'zustand';
import hackLog from '@/lib/logger';
import { User } from '@/lib/api/users';

// Users Store State Interface
interface UsersState {
  // Selected user for detail view
  selectedUser: User | null;
  
  // Filters for user list
  filters: {
    page: number;
    limit: number;
    orgId: string | null;
    searchTerm: string;
  };
  
  // UI state
  isUserDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isAddToOrgDialogOpen: boolean;

  // Actions
  setSelectedUser: (user: User | null) => void;
  setFilters: (filters: Partial<UsersState['filters']>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setOrgId: (orgId: string | null) => void;
  setSearchTerm: (searchTerm: string) => void;
  setUserDialogOpen: (isOpen: boolean) => void;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  setAddToOrgDialogOpen: (isOpen: boolean) => void;
}

/**
 * Users Store - Client-side state management for users
 * Following hackathon rules for simple, debuggable state management
 */
export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state
  selectedUser: null,
  
  filters: {
    page: 1,
    limit: 20,
    orgId: null,
    searchTerm: ''
  },
  
  isUserDialogOpen: false,
  isDeleteDialogOpen: false,
  isAddToOrgDialogOpen: false,

  /**
   * Set selected user for detail view
   */
  setSelectedUser: (user: User | null) => {
    hackLog.storeAction('setSelectedUser', {
      userId: user?.id,
      email: user?.email,
      trigger: 'user_selection'
    });

    set({ selectedUser: user });
  },

  /**
   * Update filters (partial update)
   */
  setFilters: (filters: Partial<UsersState['filters']>) => {
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
        page: 1,
        limit: 20,
        orgId: null,
        searchTerm: ''
      }
    });
  },

  /**
   * Set current page
   */
  setPage: (page: number) => {
    hackLog.storeAction('setPage', {
      page,
      previousPage: get().filters.page,
      trigger: 'pagination'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        page
      }
    }));
  },

  /**
   * Set items per page
   */
  setLimit: (limit: number) => {
    hackLog.storeAction('setLimit', {
      limit,
      previousLimit: get().filters.limit,
      trigger: 'pagination'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        limit,
        page: 1 // Reset to first page when changing limit
      }
    }));
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
        orgId,
        page: 1 // Reset to first page when changing org filter
      }
    }));
  },

  /**
   * Set search term filter
   */
  setSearchTerm: (searchTerm: string) => {
    hackLog.storeAction('setSearchTerm', {
      searchTerm,
      previousSearchTerm: get().filters.searchTerm,
      trigger: 'search'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        searchTerm,
        page: 1 // Reset to first page when searching
      }
    }));
  },

  /**
   * Toggle user dialog (for create/edit)
   */
  setUserDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setUserDialogOpen', {
      isOpen,
      trigger: 'dialog_toggle'
    });

    set({ isUserDialogOpen: isOpen });
  },

  /**
   * Toggle delete confirmation dialog
   */
  setDeleteDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setDeleteDialogOpen', {
      isOpen,
      userId: get().selectedUser?.id,
      trigger: 'dialog_toggle'
    });

    set({ isDeleteDialogOpen: isOpen });
  },

  /**
   * Toggle add to organization dialog
   */
  setAddToOrgDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setAddToOrgDialogOpen', {
      isOpen,
      userId: get().selectedUser?.id,
      trigger: 'dialog_toggle'
    });

    set({ isAddToOrgDialogOpen: isOpen });
  }
}));

// Export selector hooks for easy access to specific store parts
export const useSelectedUser = () => useUsersStore(state => state.selectedUser);
export const useUsersFilters = () => useUsersStore(state => state.filters);
export const useUsersDialogs = () => useUsersStore(state => ({
  isUserDialogOpen: state.isUserDialogOpen,
  isDeleteDialogOpen: state.isDeleteDialogOpen,
  isAddToOrgDialogOpen: state.isAddToOrgDialogOpen
}));
