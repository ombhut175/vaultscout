import { create } from 'zustand';
import hackLog from '@/lib/logger';
import { Document } from '@/lib/api/documents';

// Documents Store State Interface
interface DocumentsState {
  // Selected document for detail view
  selectedDoc: Document | null;
  
  // Filters for document list
  filters: {
    page: number;
    limit: number;
    orgId: string | null;
    status: string | null;
    fileType: string | null;
    tags: string[];
    searchTerm: string;
  };
  
  // UI state
  isDocDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isUploadDialogOpen: boolean;

  // Actions
  setSelectedDoc: (doc: Document | null) => void;
  setFilters: (filters: Partial<DocumentsState['filters']>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setOrgId: (orgId: string | null) => void;
  setStatus: (status: string | null) => void;
  setFileType: (fileType: string | null) => void;
  setTags: (tags: string[]) => void;
  setSearchTerm: (searchTerm: string) => void;
  setDocDialogOpen: (isOpen: boolean) => void;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  setUploadDialogOpen: (isOpen: boolean) => void;
}

/**
 * Documents Store - Client-side state management for documents
 * Following hackathon rules for simple, debuggable state management
 */
export const useDocsStore = create<DocumentsState>((set, get) => ({
  // Initial state
  selectedDoc: null,
  
  filters: {
    page: 1,
    limit: 20,
    orgId: null,
    status: null,
    fileType: null,
    tags: [],
    searchTerm: ''
  },
  
  isDocDialogOpen: false,
  isDeleteDialogOpen: false,
  isUploadDialogOpen: false,

  /**
   * Set selected document for detail view
   */
  setSelectedDoc: (doc: Document | null) => {
    hackLog.storeAction('setSelectedDoc', {
      docId: doc?.id,
      title: doc?.title,
      trigger: 'doc_selection'
    });

    set({ selectedDoc: doc });
  },

  /**
   * Update filters (partial update)
   */
  setFilters: (filters: Partial<DocumentsState['filters']>) => {
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
        status: null,
        fileType: null,
        tags: [],
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
   * Set status filter
   */
  setStatus: (status: string | null) => {
    hackLog.storeAction('setStatus', {
      status,
      previousStatus: get().filters.status,
      trigger: 'filter_change'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        status,
        page: 1
      }
    }));
  },

  /**
   * Set file type filter
   */
  setFileType: (fileType: string | null) => {
    hackLog.storeAction('setFileType', {
      fileType,
      previousFileType: get().filters.fileType,
      trigger: 'filter_change'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        fileType,
        page: 1
      }
    }));
  },

  /**
   * Set tags filter
   */
  setTags: (tags: string[]) => {
    hackLog.storeAction('setTags', {
      tags,
      previousTags: get().filters.tags,
      trigger: 'filter_change'
    });

    set((state) => ({
      filters: {
        ...state.filters,
        tags,
        page: 1
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
   * Toggle document dialog (for edit)
   */
  setDocDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setDocDialogOpen', {
      isOpen,
      trigger: 'dialog_toggle'
    });

    set({ isDocDialogOpen: isOpen });
  },

  /**
   * Toggle delete confirmation dialog
   */
  setDeleteDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setDeleteDialogOpen', {
      isOpen,
      docId: get().selectedDoc?.id,
      trigger: 'dialog_toggle'
    });

    set({ isDeleteDialogOpen: isOpen });
  },

  /**
   * Toggle upload dialog
   */
  setUploadDialogOpen: (isOpen: boolean) => {
    hackLog.storeAction('setUploadDialogOpen', {
      isOpen,
      trigger: 'dialog_toggle'
    });

    set({ isUploadDialogOpen: isOpen });
  }
}));

// Export selector hooks for easy access to specific store parts
export const useSelectedDoc = () => useDocsStore(state => state.selectedDoc);
export const useDocsFilters = () => useDocsStore(state => state.filters);
export const useDocsDialogs = () => useDocsStore(state => ({
  isDocDialogOpen: state.isDocDialogOpen,
  isDeleteDialogOpen: state.isDeleteDialogOpen,
  isUploadDialogOpen: state.isUploadDialogOpen
}));
