export interface UserProfile {
    id: string;
    sessionId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    phone?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserPreferences {
    id: string;
    sessionId: string;
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
    createdAt: string;
    updatedAt: string;
}
export declare class UserService {
    private static instance;
    private db;
    private constructor();
    static getInstance(): UserService;
    /**
     * Get user profile by session ID
     */
    getUserProfile(sessionId: string): Promise<UserProfile | null>;
    /**
     * Create or update user profile
     */
    upsertUserProfile(sessionId: string, profileData: Partial<Omit<UserProfile, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile>;
    /**
     * Get user preferences by session ID
     */
    getUserPreferences(sessionId: string): Promise<UserPreferences | null>;
    /**
     * Create or update user preferences
     */
    upsertUserPreferences(sessionId: string, preferencesData: Partial<Omit<UserPreferences, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>>): Promise<UserPreferences>;
    /**
     * Export all user data for a session
     */
    exportUserData(sessionId: string): Promise<{
        profile: UserProfile | null;
        preferences: UserPreferences | null;
        messages: any[];
        moodEntries: any[];
        activities: any[];
        riskAssessments: any[];
    }>;
    /**
     * Delete all user data for a session
     */
    deleteUserData(sessionId: string): Promise<void>;
    /**
     * Check if user has profile data
     */
    hasUserProfile(sessionId: string): Promise<boolean>;
    /**
     * Check if user has preferences data
     */
    hasUserPreferences(sessionId: string): Promise<boolean>;
}
//# sourceMappingURL=userService.d.ts.map