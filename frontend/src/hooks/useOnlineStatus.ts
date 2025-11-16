// Hook to detect online/offline status
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import hackLog from '@/lib/logger';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      hackLog.info('Network connection restored');
      setIsOnline(true);
      toast.success('🌐 Connection restored');
    };

    const handleOffline = () => {
      hackLog.warn('Network connection lost');
      setIsOnline(false);
      toast.error('📡 You are offline. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
