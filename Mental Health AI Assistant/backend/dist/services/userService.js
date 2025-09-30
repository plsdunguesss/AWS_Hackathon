"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../database/database");
const uuid_1 = require("uuid");
class UserService {
    constructor() {
        this.db = database_1.Database.getInstance();
    }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    /**
     * Get user profile by session ID
     */
    async getUserProfile(sessionId) {
        try {
            const query = `
        SELECT 
          id,
          session_id as sessionId,
          first_name as firstName,
          last_name as lastName,
          email,
          bio,
          phone,
          avatar_url as avatarUrl,
          created_at as createdAt,
          updated_at as updatedAt
        FROM user_profiles 
        WHERE session_id = ?
      `;
            const result = await this.db.get(query, [sessionId]);
            return result || null;
        }
        catch (error) {
            console.error('Error getting user profile:', error);
            throw new Error('Failed to retrieve user profile');
        }
    }
    /**
     * Create or update user profile
     */
    async upsertUserProfile(sessionId, profileData) {
        try {
            const existingProfile = await this.getUserProfile(sessionId);
            const now = new Date().toISOString();
            if (existingProfile) {
                // Update existing profile
                const updateQuery = `
          UPDATE user_profiles 
          SET 
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            email = COALESCE(?, email),
            bio = COALESCE(?, bio),
            phone = COALESCE(?, phone),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = ?
          WHERE session_id = ?
        `;
                await this.db.run(updateQuery, [
                    profileData.firstName || null,
                    profileData.lastName || null,
                    profileData.email || null,
                    profileData.bio || null,
                    profileData.phone || null,
                    profileData.avatarUrl || null,
                    now,
                    sessionId
                ]);
                return await this.getUserProfile(sessionId);
            }
            else {
                // Create new profile
                const profileId = (0, uuid_1.v4)();
                const insertQuery = `
          INSERT INTO user_profiles (
            id, session_id, first_name, last_name, email, bio, phone, avatar_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
                await this.db.run(insertQuery, [
                    profileId,
                    sessionId,
                    profileData.firstName || null,
                    profileData.lastName || null,
                    profileData.email || null,
                    profileData.bio || null,
                    profileData.phone || null,
                    profileData.avatarUrl || null,
                    now,
                    now
                ]);
                return await this.getUserProfile(sessionId);
            }
        }
        catch (error) {
            console.error('Error upserting user profile:', error);
            throw new Error('Failed to save user profile');
        }
    }
    /**
     * Get user preferences by session ID
     */
    async getUserPreferences(sessionId) {
        try {
            const query = `
        SELECT 
          id,
          session_id as sessionId,
          theme,
          language,
          timezone,
          reminder_time as reminderTime,
          weekly_report_day as weeklyReportDay,
          notifications,
          privacy,
          created_at as createdAt,
          updated_at as updatedAt
        FROM user_preferences 
        WHERE session_id = ?
      `;
            const result = await this.db.get(query, [sessionId]);
            if (result) {
                // Parse JSON fields
                result.notifications = JSON.parse(result.notifications);
                result.privacy = JSON.parse(result.privacy);
            }
            return result || null;
        }
        catch (error) {
            console.error('Error getting user preferences:', error);
            throw new Error('Failed to retrieve user preferences');
        }
    }
    /**
     * Create or update user preferences
     */
    async upsertUserPreferences(sessionId, preferencesData) {
        try {
            const existingPreferences = await this.getUserPreferences(sessionId);
            const now = new Date().toISOString();
            if (existingPreferences) {
                // Update existing preferences
                const updateQuery = `
          UPDATE user_preferences 
          SET 
            theme = COALESCE(?, theme),
            language = COALESCE(?, language),
            timezone = COALESCE(?, timezone),
            reminder_time = COALESCE(?, reminder_time),
            weekly_report_day = COALESCE(?, weekly_report_day),
            notifications = COALESCE(?, notifications),
            privacy = COALESCE(?, privacy),
            updated_at = ?
          WHERE session_id = ?
        `;
                await this.db.run(updateQuery, [
                    preferencesData.theme || null,
                    preferencesData.language || null,
                    preferencesData.timezone || null,
                    preferencesData.reminderTime || null,
                    preferencesData.weeklyReportDay || null,
                    preferencesData.notifications ? JSON.stringify(preferencesData.notifications) : null,
                    preferencesData.privacy ? JSON.stringify(preferencesData.privacy) : null,
                    now,
                    sessionId
                ]);
                return await this.getUserPreferences(sessionId);
            }
            else {
                // Create new preferences with defaults
                const preferencesId = (0, uuid_1.v4)();
                const defaultNotifications = {
                    checkInReminders: true,
                    chatNotifications: true,
                    appointmentReminders: true,
                    weeklyReports: false,
                    emergencyAlerts: true,
                    marketingEmails: false
                };
                const defaultPrivacy = {
                    dataSharing: false,
                    anonymousResearch: true,
                    profileVisibility: 'private',
                    activityTracking: true
                };
                const insertQuery = `
          INSERT INTO user_preferences (
            id, session_id, theme, language, timezone, reminder_time, weekly_report_day, 
            notifications, privacy, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
                await this.db.run(insertQuery, [
                    preferencesId,
                    sessionId,
                    preferencesData.theme || 'system',
                    preferencesData.language || 'en',
                    preferencesData.timezone || 'America/New_York',
                    preferencesData.reminderTime || '09:00',
                    preferencesData.weeklyReportDay || 'sunday',
                    JSON.stringify(preferencesData.notifications || defaultNotifications),
                    JSON.stringify(preferencesData.privacy || defaultPrivacy),
                    now,
                    now
                ]);
                return await this.getUserPreferences(sessionId);
            }
        }
        catch (error) {
            console.error('Error upserting user preferences:', error);
            throw new Error('Failed to save user preferences');
        }
    }
    /**
     * Export all user data for a session
     */
    async exportUserData(sessionId) {
        try {
            // Get all user data
            const [profile, preferences] = await Promise.all([
                this.getUserProfile(sessionId),
                this.getUserPreferences(sessionId)
            ]);
            // Get conversation history
            const messagesQuery = `
        SELECT id, content, sender, timestamp, empathy_score as empathyScore
        FROM messages 
        WHERE session_id = ? 
        ORDER BY timestamp ASC
      `;
            const messages = await this.db.all(messagesQuery, [sessionId]);
            // Get mood entries
            const moodQuery = `
        SELECT id, date, mood, energy, stress, anxiety, sleep, notes, timestamp
        FROM mood_entries 
        WHERE session_id = ? 
        ORDER BY date ASC
      `;
            const moodEntries = await this.db.all(moodQuery, [sessionId]);
            // Get activities
            const activitiesQuery = `
        SELECT id, type, title, description, timestamp, metadata
        FROM activities 
        WHERE session_id = ? 
        ORDER BY timestamp ASC
      `;
            const activities = await this.db.all(activitiesQuery, [sessionId]);
            // Get risk assessments
            const riskQuery = `
        SELECT id, overall_risk, depression_markers, anxiety_markers, 
               self_harm_risk, suicidal_ideation, social_isolation, 
               confidence, recommends_professional_help, created_at
        FROM risk_assessments 
        WHERE session_id = ? 
        ORDER BY created_at ASC
      `;
            const riskAssessments = await this.db.all(riskQuery, [sessionId]);
            return {
                profile,
                preferences,
                messages,
                moodEntries,
                activities,
                riskAssessments
            };
        }
        catch (error) {
            console.error('Error exporting user data:', error);
            throw new Error('Failed to export user data');
        }
    }
    /**
     * Delete all user data for a session
     */
    async deleteUserData(sessionId) {
        try {
            // Delete user profile and preferences (other data will cascade delete via foreign keys)
            await this.db.run('DELETE FROM user_profiles WHERE session_id = ?', [sessionId]);
            await this.db.run('DELETE FROM user_preferences WHERE session_id = ?', [sessionId]);
            // The session itself and all related data will be cleaned up by the session service
            console.log(`User data deleted for session: ${sessionId}`);
        }
        catch (error) {
            console.error('Error deleting user data:', error);
            throw new Error('Failed to delete user data');
        }
    }
    /**
     * Check if user has profile data
     */
    async hasUserProfile(sessionId) {
        try {
            const profile = await this.getUserProfile(sessionId);
            return profile !== null;
        }
        catch (error) {
            console.error('Error checking user profile:', error);
            return false;
        }
    }
    /**
     * Check if user has preferences data
     */
    async hasUserPreferences(sessionId) {
        try {
            const preferences = await this.getUserPreferences(sessionId);
            return preferences !== null;
        }
        catch (error) {
            console.error('Error checking user preferences:', error);
            return false;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map