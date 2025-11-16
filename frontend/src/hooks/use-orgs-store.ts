import { create } from 'zustand';
import hackLog from '@/lib/logger';
import { Organization } from '@/lib/api/organizations';

// Organizations Store State Interface
interface OrganizationsState {
  // Selected organization for detail view
  selectedOrg: Organization | null;
  
  // UI state
  isOrgDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Actions
  setSelectedOrg: (org: Organization | null) => void;
  setOrgDialogOpen: (isOpen: boolean) => void;
  setDeleteDialogOpen: (isOpen: boolean) => void;
}

/**
 * Organizations Store - Client-side state management for organizations
 * Following hackathon rules for simple, debuggable state management
 */
export const useOrgsStore = create<OrganizationsState>((set, get) => ({
  // Initial state
  selectedOrg: null,
  
  isOrgDialogOpen: false,
  isDeleteDialogOpen: false,

  /**
   * Set selected organization for detail view
   */
  setSelectedOrg: (org: Organization | null) => {
    hackLog.storeAction('setSelectedOrg', {
      orgId: org?.id,
      orgName: org?.name,
      trigger: 'org_selection'
    });

    set({ selectedOrg: org });
  },

  /**
   * Toggle organization dialog (for create/edit)
   */
  setOrgDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setOrgDialogOpen', {
      isOpen,
      trigger: 'dialog_toggle'
    });

    set({ isOrgDialogOpen: isOpen });
  },

  /**
   * Toggle delete confirmation dialog
   */
  setDeleteDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setDeleteDialogOpen', {
      isOpen,
      orgId: get().selectedOrg?.id,
      trigger: 'dialog_toggle'
    });

    set({ isDeleteDialogOpen: isOpen });
  }
}));

// Export selector hooks for easy access to specific store parts
export const useSelectedOrg = () => useOrgsStore(state => state.selectedOrg);
export const useOrgsDialogs = () => useOrgsStore(state => ({
  isOrgDialogOpen: state.isOrgDialogOpen,
  isDeleteDialogOpen: state.isDeleteDialogOpen
}));
