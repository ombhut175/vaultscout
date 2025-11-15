// lib/store.ts - FOLLOWS HACKATHON RULES
import { create } from 'zustand'
import { handleError } from '@/helpers/errors' // 🚨 MUST USE helpers/errors
import hackLog from '@/lib/logger'

interface TestingStore {
  // UI State
  loading: boolean
  error: string | null
  lastRefresh: Date | null
  
  // Testing Data
  testingData: any | null
  systemStatus: 'healthy' | 'warning' | 'error' | 'unknown'
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setErrorFromException: (error: unknown) => void // 🚨 Uses helpers/errors
  setTestingData: (data: any) => void
  setLastRefresh: (date: Date) => void
  setSystemStatus: (status: 'healthy' | 'warning' | 'error' | 'unknown') => void
  clearData: () => void
}

export const useTestingStore = create<TestingStore>((set) => ({
  // Initial state
  loading: false,
  error: null,
  lastRefresh: null,
  testingData: null,
  systemStatus: 'unknown',
  
  // Actions
  setLoading: (loading) => {
    hackLog.storeAction('setLoading', { loading })
    set({ loading })
  },
  
  setError: (error) => {
    hackLog.storeAction('setError', { error })
    set({ error })
  },
  
  // 🚨 FOLLOWS RULES - Uses helpers/errors
  setErrorFromException: (error) => {
    hackLog.storeAction('setErrorFromException', { error })
    const errorMessage = handleError(error, { toast: false }) // Handle error but don't show toast (store handles it)
    set({ error: errorMessage, systemStatus: 'error' })
  },
  
  setTestingData: (data) => {
    hackLog.storeAction('setTestingData', { dataType: typeof data, isArray: Array.isArray(data) })
    set({ testingData: data })
  },
  
  setLastRefresh: (date) => {
    hackLog.storeAction('setLastRefresh', { date })
    set({ lastRefresh: date })
  },
  
  setSystemStatus: (status) => {
    hackLog.storeAction('setSystemStatus', { status })
    set({ systemStatus: status })
  },
  
  clearData: () => {
    hackLog.storeAction('clearData')
    set({ 
      testingData: null, 
      error: null, 
      lastRefresh: null, 
      systemStatus: 'unknown' 
    })
  },
}))

// Helper to get current store state (useful for debugging)
export const getStoreState = () => useTestingStore.getState()
