import { useState, useEffect } from 'react';
import { apiService, AnalyticsData, ProgressMetrics, MoodEntry, Achievement } from '../services/api';

export function useProgress(sessionId: string | null) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const loadProgressData = async (range = timeRange) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Load analytics, mood history, and achievements in parallel
      const [analyticsResponse, moodResponse, achievementsResponse] = await Promise.all([
        apiService.getProgressAnalytics(sessionId, range),
        apiService.getMoodHistory(sessionId, range === '7d' ? 7 : range === '30d' ? 30 : 90),
        apiService.getAchievements(sessionId)
      ]);

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data.analytics);
        setMetrics(analyticsResponse.data.metrics);
      } else {
        console.warn('Failed to load analytics:', analyticsResponse.error);
      }

      if (moodResponse.success && moodResponse.data) {
        setMoodHistory(moodResponse.data.entries);
      } else {
        console.warn('Failed to load mood history:', moodResponse.error);
      }

      if (achievementsResponse.success && achievementsResponse.data) {
        setAchievements(achievementsResponse.data.achievements);
      } else {
        console.warn('Failed to load achievements:', achievementsResponse.error);
      }

      // Only set error if all requests failed
      if (!analyticsResponse.success && !moodResponse.success && !achievementsResponse.success) {
        setError('Failed to load progress data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const updateTimeRange = async (newRange: string) => {
    setTimeRange(newRange);
    await loadProgressData(newRange);
  };

  // Calculate trends and insights from mood history
  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, data.length);
    const earlier = data.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, data.length);
    return ((recent - earlier) / earlier) * 100;
  };

  const getMetricStats = (metric: keyof MoodEntry) => {
    const values = moodHistory.map(d => d[metric] as number).filter(v => typeof v === 'number');
    if (values.length === 0) return { average: 0, min: 0, max: 0 };
    
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { average: Math.round(average * 10) / 10, min, max };
  };

  const getTrends = () => {
    if (moodHistory.length === 0) {
      return {
        mood: 0,
        energy: 0,
        stress: 0,
        anxiety: 0,
        sleep: 0
      };
    }

    return {
      mood: calculateTrend(moodHistory.map(d => d.mood)),
      energy: calculateTrend(moodHistory.map(d => d.energy)),
      stress: calculateTrend(moodHistory.map(d => d.stress)),
      anxiety: calculateTrend(moodHistory.map(d => d.anxiety)),
      sleep: calculateTrend(moodHistory.map(d => d.sleep))
    };
  };

  const getInsights = () => {
    // Use backend analytics insights if available
    if (analytics?.patterns && analytics.patterns.length > 0) {
      return analytics.patterns.map(pattern => ({
        type: pattern.type === 'trend' && pattern.data.change > 0 ? 'positive' : 'neutral',
        title: pattern.title,
        description: pattern.description,
        metric: pattern.type === 'trend' ? `${pattern.data.change > 0 ? '+' : ''}${Math.round(pattern.data.change)}%` : '',
        icon: pattern.type === 'trend' ? (pattern.data.change > 0 ? 'TrendingUp' : 'TrendingDown') : 'BarChart3',
        color: pattern.type === 'trend' && pattern.data.change > 0 ? 'text-green-600' : 'text-blue-600'
      }));
    }

    // Fallback to calculated insights
    const trends = getTrends();
    const insights = [];

    if (trends.mood > 10) {
      insights.push({
        type: 'positive',
        title: 'Mood Improvement',
        description: `Your average mood has increased by ${Math.round(trends.mood)}% over the selected period`,
        metric: `+${Math.round(trends.mood)}%`,
        icon: 'TrendingUp',
        color: 'text-green-600'
      });
    }

    if (trends.stress < -10) {
      insights.push({
        type: 'positive',
        title: 'Stress Reduction',
        description: `Your stress levels have decreased by ${Math.round(Math.abs(trends.stress))}%`,
        metric: `${Math.round(trends.stress)}%`,
        icon: 'TrendingDown',
        color: 'text-green-600'
      });
    }

    const sleepStats = getMetricStats('sleep');
    if (sleepStats.average >= 7) {
      insights.push({
        type: 'neutral',
        title: 'Sleep Quality',
        description: `Your sleep scores have been consistently good (${sleepStats.average}/10)`,
        metric: `${sleepStats.average}/10`,
        icon: 'BarChart3',
        color: 'text-blue-600'
      });
    }

    return insights;
  };

  useEffect(() => {
    if (sessionId) {
      loadProgressData();
    }
  }, [sessionId]);

  return {
    analytics,
    metrics,
    moodHistory,
    achievements,
    loading,
    error,
    timeRange,
    updateTimeRange,
    refreshData: loadProgressData,
    getMetricStats,
    getTrends,
    getInsights,
  };
}