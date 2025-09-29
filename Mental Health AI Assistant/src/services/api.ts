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
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          errors: data.errors,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
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
    return this.request(`/sessions/${sessionId}`);
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
    return this.request(`/dashboard/${sessionId}`);
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