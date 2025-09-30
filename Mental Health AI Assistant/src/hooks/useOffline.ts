import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  timestamp: number;
  data: any;
}

interface UseOfflineOptions {
  storageKey?: string;
  maxAge?: number; // in milliseconds
  syncOnReconnect?: boolean;
}

export function useOffline<T>(
  fetchFn: () => Promise<T>,
  options: UseOfflineOptions = {}
) {
  const {
    storageKey = 'offline_data',
    maxAge = 5 * 60 * 1000, // 5 minutes default
    syncOnReconnect = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStale, setIsStale] = useState(false);

  // Load cached data from localStorage
  const loadCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsedData: OfflineData = JSON.parse(cached);
        const age = Date.now() - parsedData.timestamp;
        
        if (age < maxAge) {
          setData(parsedData.data);
          setIsStale(false);
          return true;
        } else {
          setIsStale(true);
          setData(parsedData.data); // Still show stale data
          return false;
        }
      }
    } catch (err) {
      console.error('Failed to load cached data:', err);
    }
    return false;
  }, [storageKey, maxAge]);

  // Save data to localStorage
  const cacheData = useCallback((newData: T) => {
    try {
      const cacheEntry: OfflineData = {
        timestamp: Date.now(),
        data: newData,
      };
      localStorage.setItem(storageKey, JSON.stringify(cacheEntry));
    } catch (err) {
      console.error('Failed to cache data:', err);
    }
  }, [storageKey]);

  // Fetch fresh data
  const fetchData = useCallback(async (force = false) => {
    if (!isOnline && !force) {
      const hasCached = loadCachedData();
      if (!hasCached) {
        setError('No internet connection and no cached data available');
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFn();
      setData(result);
      setIsStale(false);
      cacheData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Try to load cached data as fallback
      const hasCached = loadCachedData();
      if (hasCached) {
        setError(`${errorMessage} (showing cached data)`);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, isOnline, loadCachedData, cacheData]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncOnReconnect) {
        fetchData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData, syncOnReconnect]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setData(null);
      setIsStale(false);
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, [storageKey]);

  return {
    data,
    loading,
    error,
    isOnline,
    isStale,
    retry,
    clearCache,
    refetch: fetchData,
  };
}

// Hook for managing offline queue
export function useOfflineQueue<T>(
  syncFn: (item: T) => Promise<void>,
  storageKey = 'offline_queue'
) {
  const [queue, setQueue] = useState<T[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load queue from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load offline queue:', err);
    }
  }, [storageKey]);

  // Save queue to localStorage
  const saveQueue = useCallback((newQueue: T[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newQueue));
      setQueue(newQueue);
    } catch (err) {
      console.error('Failed to save offline queue:', err);
    }
  }, [storageKey]);

  // Add item to queue
  const addToQueue = useCallback((item: T) => {
    const newQueue = [...queue, item];
    saveQueue(newQueue);
  }, [queue, saveQueue]);

  // Sync queue when online
  const syncQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || syncing) return;

    setSyncing(true);
    const remainingQueue: T[] = [];

    for (const item of queue) {
      try {
        await syncFn(item);
      } catch (err) {
        console.error('Failed to sync item:', err);
        remainingQueue.push(item);
      }
    }

    saveQueue(remainingQueue);
    setSyncing(false);
  }, [isOnline, queue, syncing, syncFn, saveQueue]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncQueue();
    }
  }, [isOnline, queue.length, syncQueue]);

  const clearQueue = useCallback(() => {
    saveQueue([]);
  }, [saveQueue]);

  return {
    queue,
    queueSize: queue.length,
    syncing,
    isOnline,
    addToQueue,
    syncQueue,
    clearQueue,
  };
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');

      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };

      connection.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g',
  };
}