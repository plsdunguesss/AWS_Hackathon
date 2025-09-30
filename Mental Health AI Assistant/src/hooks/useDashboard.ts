import { useState, useEffect, useCallback } from 'react';
import { apiService, Activity, Achievement, MoodEntry, ProgressMetrics } from '../services/api';
import { useErrorHandler } from './useErrorHandler';
import { useOffline, useOfflineQueue } from './useOffline';
import { useToast } from '../components/ui/toast';

interface UpcomingTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
}

interface DashboardData {
  currentMood: MoodEntry | null;
  recentActivities: Activity[];
  upcomingTasks: UpcomingTask[];
  achievements: Achievement[];
  progressMetrics: ProgressMetrics;
}

interface QueuedMoodEntry {
  type: 'mood';
  sessionId: string;
  data: {
    mood: number;
    energy: number;
    stress: number;
    anxiety: number;
    sleep: number;
    notes?: string;
  };
}

interface QueuedActivity {
  type: 'activity';
  sessionId: string;
  data: {
    type: Activity['type'];
    title: string;
    description: string;
    metadata?: Record<string, any>;
  };
}

type QueuedItem = QueuedMoodEntry | QueuedActivity;

export function useDashboard(sessionId: string | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const { handleError, errorState, clearError, retry } = useErrorHandler({
    showToast: true,
    maxRetries: 3,
  });

  // Offline queue for mood entries and activities
  const { addToQueue, queueSize } = useOfflineQueue<QueuedItem>(
    async (item) => {
      if (item.type === 'mood') {
        await apiService.submitMoodEntry(item.sessionId, item.data);
      } else if (item.type === 'activity') {
        await apiService.logActivity(item.sessionId, item.data);
      }
    },
    'dashboard_queue'
  );

  // Use offline support for dashboard data
  const {
    data: offlineData,
    loading: offlineLoading,
    error: offlineError,
    isStale,
    retry: retryOffline,
  } = useOffline(
    async () => {
      if (!sessionId) throw new Error('No session ID');
      const response = await apiService.getDashboardData(sessionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load dashboard data');
      }
      return response.data;
    },
    {
      storageKey: `dashboard_${sessionId}`,
      maxAge: 5 * 60 * 1000, // 5 minutes
      syncOnReconnect: true,
    }
  );

  // Update local state when offline data changes
  useEffect(() => {
    if (offlineData) {
      setData(offlineData);
    }
    setLoading(offlineLoading);
    
    if (offlineError) {
      const errorType = !navigator.onLine ? 'offline' : 'network';
      handleError(offlineError, errorType);
    } else {
      clearError();
    }
  }, [offlineData, offlineLoading, offlineError, handleError, clearError]);

  const loadDashboardData = useCallback(async () => {
    if (!sessionId) return;
    await retryOffline();
  }, [sessionId, retryOffline]);

  const submitMoodEntry = useCallback(async (moodData: {
    mood: number;
    energy: number;
    stress: number;
    anxiety: number;
    sleep: number;
    notes?: string;
  }) => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      if (!navigator.onLine) {
        // Add to offline queue
        addToQueue({
          type: 'mood',
          sessionId,
          data: moodData,
        });
        
        addToast({
          type: 'info',
          description: 'Mood entry saved offline. Will sync when connection is restored.',
        });
        
        return { success: true };
      }

      const response = await apiService.submitMoodEntry(sessionId, moodData);
      if (response.success) {
        // Refresh dashboard data after mood entry
        await loadDashboardData();
        
        addToast({
          type: 'success',
          description: 'Mood entry saved successfully!',
        });
        
        return { success: true };
      } else {
        handleError(response.error || 'Failed to submit mood entry', 'api');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to submit mood entry';
      handleError(error, 'network');
      return { success: false, error };
    }
  }, [sessionId, addToQueue, addToast, loadDashboardData, handleError]);

  const logActivity = useCallback(async (activity: {
    type: Activity['type'];
    title: string;
    description: string;
    metadata?: Record<string, any>;
  }) => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      if (!navigator.onLine) {
        // Add to offline queue
        addToQueue({
          type: 'activity',
          sessionId,
          data: activity,
        });
        
        addToast({
          type: 'info',
          description: 'Activity logged offline. Will sync when connection is restored.',
        });
        
        return { success: true };
      }

      const response = await apiService.logActivity(sessionId, activity);
      if (response.success) {
        // Refresh dashboard data after logging activity
        await loadDashboardData();
        return { success: true };
      } else {
        handleError(response.error || 'Failed to log activity', 'api');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to log activity';
      handleError(error, 'network');
      return { success: false, error };
    }
  }, [sessionId, addToQueue, addToast, loadDashboardData, handleError]);

  const retryLoadData = useCallback(async () => {
    const success = await retry(loadDashboardData);
    return success;
  }, [retry, loadDashboardData]);

  // Show queue size notification
  useEffect(() => {
    if (queueSize > 0) {
      addToast({
        type: 'info',
        description: `${queueSize} items queued for sync when online`,
        duration: 3000,
      });
    }
  }, [queueSize, addToast]);

  return {
    data,
    loading,
    error: errorState.error,
    errorType: errorState.type,
    isStale,
    queueSize,
    refreshData: loadDashboardData,
    retryLoadData,
    submitMoodEntry,
    logActivity,
    canRetry: errorState.retryCount < 3,
  };
}