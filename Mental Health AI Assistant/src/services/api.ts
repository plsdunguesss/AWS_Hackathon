// API service for connecting frontend to backend
const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface Session {
  id: string;
  startTime: string;
  lastActivity: string;
  riskScore: number;
  referralTriggered: boolean;
}

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  empathyScore?: number;
}

export interface RiskScore {
  overallRisk: number;
  indicators: {
    depressionMarkers: number;
    anxietyMarkers: number;
    selfHarmRisk: number;
    suicidalIdeation: number;
    socialIsolation: number;
  };
  confidence: number;
  recommendsProfessionalHelp: boolean;
}

export interface ConversationResponse {
  userMessage: Message;
  aiResponse: Message;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  reminderTime: string;
  weeklyReportDay: string;
  notifications: {
    checkInReminders: boolean;
    chatNotifications: boolean;
    appointmentReminders: boolean;
    weeklyReports: boolean;
    emergencyAlerts: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    dataSharing: boolean;
    anonymousResearch: boolean;
    profileVisibility: 'private' | 'healthcare' | 'support';
    activityTracking: boolean;
  };
}

export interface MoodEntry {
  id: string;
  sessionId: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  anxiety: number;
  sleep: number;
  notes?: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  sessionId: string;
  type: 'chat' | 'assessment' | 'resource' | 'professional';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  icon: string;
  category: string;
}

export interface ProgressMetrics {
  overallProgress: number;
  streakDays: number;
  totalCheckIns: number;
  totalChatSessions: number;
  totalResourcesAccessed: number;
  averageMood: number;
  moodTrend: number;
  riskLevel: number;
}

export interface AnalyticsData {
  moodTrends: MoodEntry[];
  correlations: Array<{
    title: string;
    correlation: number;
    description: string;
    insight: string;
  }>;
  patterns: Array<{
    type: string;
    title: string;
    description: string;
    data: Record<string, any>;
  }>;
  weeklyPatterns?: {
    weekdayAverage: number;
    weekendAverage: number;
    bestDay: string;
    worstDay: string;
  };
  timePatterns?: Array<{
    hour: number;
    averageMood: number;
    averageEnergy: number;
  }>;
}

export interface AdvancedAnalytics {
  correlations: Array<{
    title: string;
    correlation: number;
    description: string;
    insight: string;
    significance: 'high' | 'medium' | 'low';
    dataPoints: number;
  }>;
  patterns: Array<{
    type: 'trend' | 'cycle' | 'anomaly' | 'consistency';
    title: string;
    description: string;
    confidence: number;
    data: Record<string, any>;
    recommendations?: string[];
  }>;
  trends: Array<{
    metric: string;
    direction: 'improving' | 'declining' | 'stable';
    magnitude: number;
    confidence: number;
    timeframe: string;
    dataPoints: number;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    targetValue: number;
    currentValue: number;
    progress: number;
    estimatedCompletion?: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;
  visualizationData: {
    chartData: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        color: string;
        type: 'line' | 'bar' | 'area';
      }>;
    };
    insights: string[];
    recommendations: string[];
  };
  riskFactors: Array<{
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
}

class ApiService {
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff
  private maxRetries = 3;

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (!response.ok) {
        const errorMessage = typeof data === 'object' && data.error 
          ? data.error 
          : `HTTP ${response.status}: ${response.statusText}`;

        // Retry on certain status codes
        if (this.shouldRetry(response.status) && retryCount < this.maxRetries) {
          await this.delay(this.retryDelays[retryCount] || 4000);
          return this.request(endpoint, options, retryCount + 1);
        }

        return {
          success: false,
          error: errorMessage,
          errors: typeof data === 'object' ? data.errors : undefined,
        };
      }

      return {
        success: true,
        data: typeof data === 'object' ? data : { result: data },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      let errorMessage = 'Network error';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server';
        } else {
          errorMessage = error.message;
        }
      }

      // Retry on network errors
      if (this.shouldRetryOnError(error) && retryCount < this.maxRetries) {
        await this.delay(this.retryDelays[retryCount] || 4000);
        return this.request(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private shouldRetry(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408;
  }

  private shouldRetryOnError(error: unknown): boolean {
    if (error instanceof Error) {
      // Retry on network errors but not on abort errors (timeouts)
      return error.name !== 'AbortError' && 
             (error.message.includes('fetch') || 
              error.message.includes('network') ||
              error.message.includes('connection'));
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced request with offline support
  private async requestWithOfflineSupport<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string
  ): Promise<ApiResponse<T>> {
    // Check if online
    if (!navigator.onLine) {
      // Try to get cached data
      if (cacheKey) {
        const cached = this.getCachedData<T>(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            error: 'Offline - showing cached data',
          };
        }
      }
      
      return {
        success: false,
        error: 'No internet connection and no cached data available',
      };
    }

    const result = await this.request<T>(endpoint, options);
    
    // Cache successful responses
    if (result.success && cacheKey && result.data) {
      this.setCachedData(cacheKey, result.data);
    }

    return result;
  }

  private getCachedData<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`api_cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const maxAge = 5 * 60 * 1000; // 5 minutes
        
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
        
        // Remove expired cache
        localStorage.removeItem(`api_cache_${key}`);
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // Health check
  async checkHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }

  // Session management
  async createSession(): Promise<ApiResponse<{ session: Session }>> {
    return this.request('/sessions', {
      method: 'POST',
    });
  }

  async getSession(sessionId: string): Promise<ApiResponse<{ session: Session }>> {
    return this.requestWithOfflineSupport(`/sessions/${sessionId}`, {}, `session_${sessionId}`);
  }

  // Conversation
  async sendMessage(sessionId: string, message: string): Promise<ApiResponse<{ conversation: ConversationResponse }>> {
    return this.request('/conversation/message', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        message,
      }),
    });
  }

  async getConversationHistory(sessionId: string, limit = 50): Promise<ApiResponse<{ messages: Message[] }>> {
    return this.request(`/conversation/${sessionId}/history?limit=${limit}`);
  }

  // Risk assessment
  async assessRisk(sessionId: string, messageId: string, content: string): Promise<ApiResponse<{ assessment: { riskScore: RiskScore; requiresReferral: boolean } }>> {
    return this.request('/risk-assessment/assess', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        messageId,
        content,
      }),
    });
  }

  async getLatestRiskAssessment(sessionId: string): Promise<ApiResponse<{ assessment: any; currentRiskLevel: number; referralTriggered: boolean }>> {
    return this.request(`/risk-assessment/session/${sessionId}/latest`);
  }

  // User Profile Management
  async getUserProfile(sessionId: string): Promise<ApiResponse<{ profile: UserProfile }>> {
    return this.request(`/user/profile/${sessionId}`);
  }

  async updateUserProfile(sessionId: string, profile: Partial<UserProfile>): Promise<ApiResponse<{ profile: UserProfile }>> {
    return this.request(`/user/profile/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // User Preferences
  async getUserPreferences(sessionId: string): Promise<ApiResponse<{ preferences: UserPreferences }>> {
    return this.request(`/user/preferences/${sessionId}`);
  }

  async updateUserPreferences(sessionId: string, preferences: Partial<UserPreferences>): Promise<ApiResponse<{ preferences: UserPreferences }>> {
    return this.request(`/user/preferences/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Dashboard Data
  async getDashboardData(sessionId: string): Promise<ApiResponse<{
    currentMood: MoodEntry | null;
    recentActivities: Activity[];
    upcomingTasks: Array<{
      id: string;
      title: string;
      description: string;
      dueDate: string;
      priority: 'high' | 'medium' | 'low';
      type: string;
    }>;
    achievements: Achievement[];
    progressMetrics: ProgressMetrics;
  }>> {
    return this.requestWithOfflineSupport(`/dashboard/${sessionId}`, {}, `dashboard_${sessionId}`);
  }

  // Mood Tracking
  async submitMoodEntry(sessionId: string, moodData: {
    mood: number;
    energy: number;
    stress: number;
    anxiety: number;
    sleep: number;
    notes?: string;
  }): Promise<ApiResponse<{ entry: MoodEntry }>> {
    return this.request('/dashboard/mood/entry', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        ...moodData,
      }),
    });
  }

  async getMoodHistory(sessionId: string, days = 30): Promise<ApiResponse<{ entries: MoodEntry[] }>> {
    return this.request(`/dashboard/mood/history/${sessionId}?days=${days}`);
  }

  // Activities
  async getActivities(sessionId: string, limit = 50): Promise<ApiResponse<{ activities: Activity[] }>> {
    return this.request(`/dashboard/activities/${sessionId}?limit=${limit}`);
  }

  async logActivity(sessionId: string, activity: {
    type: Activity['type'];
    title: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<{ activity: Activity }>> {
    return this.request('/dashboard/activities', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        ...activity,
      }),
    });
  }

  // Progress Analytics
  async getProgressAnalytics(sessionId: string, timeRange = '30d'): Promise<ApiResponse<{
    analytics: AnalyticsData;
    metrics: ProgressMetrics;
  }>> {
    return this.request(`/dashboard/progress/${sessionId}?range=${timeRange}`);
  }

  async getAchievements(sessionId: string): Promise<ApiResponse<{ achievements: Achievement[] }>> {
    return this.request(`/dashboard/achievements/${sessionId}`);
  }

  // Advanced Progress Analytics
  async getAdvancedAnalytics(sessionId: string, timeRange = '30d'): Promise<ApiResponse<AdvancedAnalytics>> {
    return this.request(`/progress-analytics/advanced/${sessionId}?range=${timeRange}`);
  }

  async getCorrelationAnalysis(sessionId: string, timeRange = '30d'): Promise<ApiResponse<{
    correlations: AdvancedAnalytics['correlations'];
  }>> {
    return this.request(`/progress-analytics/correlations/${sessionId}?range=${timeRange}`);
  }

  async getPatternDetection(sessionId: string, timeRange = '30d'): Promise<ApiResponse<{
    patterns: AdvancedAnalytics['patterns'];
  }>> {
    return this.request(`/progress-analytics/patterns/${sessionId}?range=${timeRange}`);
  }

  async getMilestoneTracking(sessionId: string): Promise<ApiResponse<{
    milestones: AdvancedAnalytics['milestones'];
  }>> {
    return this.request(`/progress-analytics/milestones/${sessionId}`);
  }

  async getVisualizationData(sessionId: string, timeRange = '30d'): Promise<ApiResponse<AdvancedAnalytics['visualizationData']>> {
    return this.request(`/progress-analytics/visualization/${sessionId}?range=${timeRange}`);
  }

  async getTrendAnalysis(sessionId: string, timeRange = '30d'): Promise<ApiResponse<{
    trends: AdvancedAnalytics['trends'];
    riskFactors: AdvancedAnalytics['riskFactors'];
  }>> {
    return this.request(`/progress-analytics/trends/${sessionId}?range=${timeRange}`);
  }

  async getInsightsAndRecommendations(sessionId: string, timeRange = '30d'): Promise<ApiResponse<{
    insights: string[];
    recommendations: string[];
    patterns: AdvancedAnalytics['patterns'];
    riskFactors: AdvancedAnalytics['riskFactors'];
  }>> {
    return this.request(`/progress-analytics/insights/${sessionId}?range=${timeRange}`);
  }

  // Data Export
  async exportUserData(sessionId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request(`/user/export/${sessionId}`, {
      method: 'POST',
    });
  }

  // Account Management
  async deleteUserData(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/user/delete/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Test endpoints
  async testOllama(): Promise<ApiResponse<{ ollama: any }>> {
    return this.request('/conversation/test-ollama');
  }
}

export const apiService = new ApiService();