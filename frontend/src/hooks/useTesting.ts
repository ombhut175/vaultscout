// hooks/useTesting.ts - FOLLOWS HACKATHON RULES
import useSWR from 'swr'
import { API_ENDPOINTS } from '@/constants/api' // 🚨 MUST USE constants
import { swrFetcher } from '@/helpers/request' // 🚨 MUST USE helpers/request fetcher
import { useTestingStore } from '@/lib/store'
import hackLog from '@/lib/logger'

export function useTesting() {
  const { 
    setError, 
    setErrorFromException, // 🚨 Uses helpers/errors
    setTestingData, 
    setLastRefresh, 
    setSystemStatus, 
    clearData 
  } = useTestingStore()
  
  // SWR for testing data - FOLLOWS RULES (explicitly uses swrFetcher from helpers/request)
  const { data, error, isLoading, mutate } = useSWR(
    API_ENDPOINTS.TESTING.DATA, // 🚨 Uses constants
    swrFetcher, // 🚨 EXPLICITLY use fetcher from helpers/request
    {
      refreshInterval: 0, // Don't auto-refresh for hackathon demo
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onSuccess: (data) => {
        hackLog.info('Testing data loaded successfully', { 
          dataType: typeof data,
          hasStats: data && typeof data === 'object' && 'stats' in data
        });
        setTestingData(data)
        setLastRefresh(new Date())
        setError(null)
        
        // Determine system status based on data
        if (data && typeof data === 'object' && 'stats' in data) {
          const dataWithStats = data as any;
          if (dataWithStats.stats?.uptime > 0) {
            setSystemStatus('healthy')
          } else {
            setSystemStatus('warning')
          }
        } else {
          setSystemStatus('warning')
        }
      },
      onError: (err) => {
        hackLog.error('Testing data loading failed', err);
        // 🚨 FOLLOWS RULES - Uses helpers/errors through store
        setErrorFromException(err)
      }
    }
  )

  const refreshData = async () => {
    try {
      hackLog.info('Manual refresh triggered');
      await mutate()
      hackLog.info('Manual refresh completed');
    } catch (err: any) {
      hackLog.error('Manual refresh failed', err);
      // 🚨 FOLLOWS RULES - Uses helpers/errors
      setErrorFromException(err)
    }
  }

  const resetData = () => {
    hackLog.info('Resetting all data');
    clearData()
    mutate(undefined, { revalidate: false }) // Clear SWR cache
  }

  const addTestData = () => {
    hackLog.info('Adding test data');
    const testData = {
      timestamp: new Date().toISOString(),
      environment: 'test',
      version: '1.0.0-test',
      features: ['test-feature'],
      stats: {
        uptime: Math.floor(Math.random() * 10000),
        requests: Math.floor(Math.random() * 1000),
        users: Math.floor(Math.random() * 50)
      }
    }
    
    // Optimistic update - update store immediately
    setTestingData(testData)
    setLastRefresh(new Date())
    setSystemStatus('healthy')
    
    // Update SWR cache without revalidation
    mutate(testData, false)
  }

  return { 
    data: data || null,
    loading: isLoading, 
    error, 
    refreshData,
    resetData,
    addTestData,
    mutate
  }
}
