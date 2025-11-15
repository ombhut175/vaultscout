"use client";

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

// Basic application-wide store
export type AppStoreState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  reset: () => void;
};

export const useAppStore = create<AppStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: false,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
        reset: () => set({ sidebarOpen: false }),
      }),
      {
        name: "app-store", // localStorage key
        version: 1,
        storage: createJSONStorage(() => localStorage),
        // Only persist what you need
        partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
      }
    ),
    { name: "AppStore" }
  )
);