import { useState, useEffect } from 'react';
import { apiService, Activity, Achievement, MoodEntry, ProgressMetrics } from '../services/api';

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

export function useDashboard(sessionId: string | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getDashboardData(sessionId);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const submitMoodEntry = async (moodData: {
    mood: number;
    energy: number;
    stress: number;
    anxiety: number;
    sleep: number;
    notes?: string;
  }) => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      const response = await apiService.submitMoodEntry(sessionId, moodData);
      if (response.success) {
        // Refresh dashboard data after mood entry
        await loadDashboardData();
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to submit mood entry' 
      };
    }
  };

  const logActivity = async (activity: {
    type: Activity['type'];
    title: string;
    description: string;
    metadata?: Record<string, any>;
  }) => {
    if (!sessionId) return { success: false, error: 'No session' };

    try {
      const response = await apiService.logActivity(sessionId, activity);
      if (response.success) {
        // Refresh dashboard data after logging activity
        await loadDashboardData();
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to log activity' 
      };
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadDashboardData();
    }
  }, [sessionId]);

  return {
    data,
    loading,
    error,
    refreshData: loadDashboardData,
    submitMoodEntry,
    logActivity,
  };
}