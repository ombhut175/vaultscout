import { useEffect } from 'react'
import useSWR from 'swr'
import { API_ENDPOINTS } from '@/constants/api'
import { swrFetcher } from '@/helpers/request'
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
    API_ENDPOINTS.TESTING.DATA,
    swrFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  )

  useEffect(() => {
    if (data) {
      hackLog.info('Testing data loaded successfully', { 
        dataType: typeof data,
        hasStats: data && typeof data === 'object' && 'stats' in data
      });
      setTestingData(data)
      setLastRefresh(new Date())
      setError(null)
      
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
    }
  }, [data, setTestingData, setLastRefresh, setError, setSystemStatus])

  useEffect(() => {
    if (error) {
      hackLog.error('Testing data loading failed', error);
      setErrorFromException(error)
    }
  }, [error, setErrorFromException])

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
