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
export interface UpcomingTask {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    type: string;
    completed: boolean;
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
    weeklyPatterns: {
        weekdayAverage: number;
        weekendAverage: number;
        bestDay: string;
        worstDay: string;
    };
    timePatterns: Array<{
        hour: number;
        averageMood: number;
        averageEnergy: number;
    }>;
}
export interface DashboardData {
    currentMood: MoodEntry | null;
    recentActivities: Activity[];
    upcomingTasks: UpcomingTask[];
    achievements: Achievement[];
    progressMetrics: ProgressMetrics;
}
export declare class DashboardService {
    private static instance;
    private db;
    private constructor();
    static getInstance(): DashboardService;
    getDashboardData(sessionId: string): Promise<DashboardData>;
    submitMoodEntry(sessionId: string, moodData: {
        mood: number;
        energy: number;
        stress: number;
        anxiety: number;
        sleep: number;
        notes?: string;
    }): Promise<MoodEntry>;
    getCurrentMood(sessionId: string): Promise<MoodEntry | null>;
    getMoodHistory(sessionId: string, days?: number): Promise<MoodEntry[]>;
    logActivity(sessionId: string, activity: {
        type: Activity['type'];
        title: string;
        description: string;
        metadata?: Record<string, any>;
    }): Promise<Activity>;
    getRecentActivities(sessionId: string, limit?: number): Promise<Activity[]>;
    getAllActivities(sessionId: string, limit?: number): Promise<Activity[]>;
    createTask(sessionId: string, task: {
        title: string;
        description: string;
        dueDate: string;
        priority: 'high' | 'medium' | 'low';
        type: string;
    }): Promise<UpcomingTask>;
    getUpcomingTasks(sessionId: string, limit?: number): Promise<UpcomingTask[]>;
    getAchievements(sessionId: string): Promise<Achievement[]>;
    checkAndAwardAchievements(sessionId: string): Promise<void>;
    private checkAchievementCriteria;
    private checkStreakCriteria;
    private checkCountCriteria;
    private checkFirstCriteria;
    getProgressMetrics(sessionId: string): Promise<ProgressMetrics>;
    private calculateMoodStreak;
    private getLatestRiskAssessment;
    getProgressAnalytics(sessionId: string, timeRange?: string): Promise<AnalyticsData>;
    private parseTimeRange;
    private calculateCorrelations;
    private calculatePearsonCorrelation;
    private identifyPatterns;
    private calculateVariance;
    private analyzeWeeklyPatterns;
    private analyzeTimePatterns;
    initializeDefaultTasks(sessionId: string): Promise<void>;
}
//# sourceMappingURL=dashboardService.d.ts.map