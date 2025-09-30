"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const database_1 = require("../database/database");
const uuid_1 = require("uuid");
class DashboardService {
    constructor() {
        this.db = database_1.Database.getInstance();
    }
    static getInstance() {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }
    // Get complete dashboard data for a session
    async getDashboardData(sessionId) {
        const [currentMood, recentActivities, upcomingTasks, achievements, progressMetrics] = await Promise.all([
            this.getCurrentMood(sessionId),
            this.getRecentActivities(sessionId, 10),
            this.getUpcomingTasks(sessionId, 10),
            this.getAchievements(sessionId),
            this.getProgressMetrics(sessionId)
        ]);
        return {
            currentMood,
            recentActivities,
            upcomingTasks,
            achievements,
            progressMetrics
        };
    }
    // Mood tracking methods
    async submitMoodEntry(sessionId, moodData) {
        const id = (0, uuid_1.v4)();
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const timestamp = new Date().toISOString();
        // Check if there's already an entry for today
        const existingEntry = await this.db.get('SELECT * FROM mood_entries WHERE session_id = ? AND date = ?', [sessionId, date]);
        let entry;
        if (existingEntry) {
            // Update existing entry
            await this.db.run(`UPDATE mood_entries 
         SET mood = ?, energy = ?, stress = ?, anxiety = ?, sleep = ?, notes = ?, timestamp = ?
         WHERE session_id = ? AND date = ?`, [moodData.mood, moodData.energy, moodData.stress, moodData.anxiety,
                moodData.sleep, moodData.notes || null, timestamp, sessionId, date]);
            entry = {
                id: existingEntry.id,
                sessionId,
                date,
                mood: moodData.mood,
                energy: moodData.energy,
                stress: moodData.stress,
                anxiety: moodData.anxiety,
                sleep: moodData.sleep,
                notes: moodData.notes,
                timestamp
            };
        }
        else {
            // Create new entry
            await this.db.run(`INSERT INTO mood_entries (id, session_id, date, mood, energy, stress, anxiety, sleep, notes, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, sessionId, date, moodData.mood, moodData.energy, moodData.stress,
                moodData.anxiety, moodData.sleep, moodData.notes || null, timestamp]);
            entry = {
                id,
                sessionId,
                date,
                mood: moodData.mood,
                energy: moodData.energy,
                stress: moodData.stress,
                anxiety: moodData.anxiety,
                sleep: moodData.sleep,
                notes: moodData.notes,
                timestamp
            };
        }
        // Log activity
        await this.logActivity(sessionId, {
            type: 'assessment',
            title: 'Mood Check-in',
            description: `Recorded mood: ${moodData.mood}/10, energy: ${moodData.energy}/10`,
            metadata: { moodData }
        });
        // Check for achievements
        await this.checkAndAwardAchievements(sessionId);
        return entry;
    }
    async getCurrentMood(sessionId) {
        const entry = await this.db.get(`SELECT * FROM mood_entries 
       WHERE session_id = ? 
       ORDER BY date DESC, timestamp DESC 
       LIMIT 1`, [sessionId]);
        return entry || null;
    }
    async getMoodHistory(sessionId, days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
        const entries = await this.db.all(`SELECT * FROM mood_entries 
       WHERE session_id = ? AND date >= ?
       ORDER BY date ASC`, [sessionId, cutoffDateStr]);
        return entries;
    }
    // Activity tracking methods
    async logActivity(sessionId, activity) {
        const id = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        await this.db.run(`INSERT INTO activities (id, session_id, type, title, description, timestamp, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, sessionId, activity.type, activity.title, activity.description,
            timestamp, activity.metadata ? JSON.stringify(activity.metadata) : null]);
        const newActivity = {
            id,
            sessionId,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            timestamp,
            metadata: activity.metadata
        };
        // Check for achievements after logging activity
        await this.checkAndAwardAchievements(sessionId);
        return newActivity;
    }
    async getRecentActivities(sessionId, limit = 10) {
        const activities = await this.db.all(`SELECT * FROM activities 
       WHERE session_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`, [sessionId, limit]);
        return activities.map((activity) => ({
            id: activity.id,
            sessionId: activity.session_id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            timestamp: activity.timestamp,
            metadata: activity.metadata ? JSON.parse(activity.metadata) : undefined
        }));
    }
    async getAllActivities(sessionId, limit = 50) {
        return this.getRecentActivities(sessionId, limit);
    }
    // Task management methods
    async createTask(sessionId, task) {
        const id = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        await this.db.run(`INSERT INTO tasks (id, session_id, title, description, due_date, priority, type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, sessionId, task.title, task.description, task.dueDate, task.priority, task.type, timestamp]);
        return {
            id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            type: task.type,
            completed: false
        };
    }
    async getUpcomingTasks(sessionId, limit = 10) {
        const tasks = await this.db.all(`SELECT * FROM tasks 
       WHERE session_id = ? AND completed = FALSE
       ORDER BY 
         CASE priority 
           WHEN 'high' THEN 1 
           WHEN 'medium' THEN 2 
           WHEN 'low' THEN 3 
         END,
         due_date ASC
       LIMIT ?`, [sessionId, limit]);
        return tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.due_date,
            priority: task.priority,
            type: task.type,
            completed: task.completed === 1
        }));
    }
    // Achievement methods
    async getAchievements(sessionId) {
        const allAchievements = await this.db.all('SELECT * FROM achievements ORDER BY category, title');
        const userAchievements = await this.db.all('SELECT achievement_id, earned_at FROM user_achievements WHERE session_id = ?', [sessionId]);
        const earnedMap = new Map(userAchievements.map(ua => [ua.achievement_id, ua.earned_at]));
        return allAchievements.map((achievement) => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            earned: earnedMap.has(achievement.id),
            earnedAt: earnedMap.get(achievement.id),
            icon: achievement.icon,
            category: achievement.category
        }));
    }
    async checkAndAwardAchievements(sessionId) {
        const achievements = await this.db.all('SELECT * FROM achievements');
        for (const achievement of achievements) {
            const criteria = JSON.parse(achievement.criteria);
            const isEarned = await this.checkAchievementCriteria(sessionId, criteria);
            if (isEarned) {
                // Check if already earned
                const existing = await this.db.get('SELECT id FROM user_achievements WHERE session_id = ? AND achievement_id = ?', [sessionId, achievement.id]);
                if (!existing) {
                    // Award achievement
                    await this.db.run('INSERT INTO user_achievements (id, session_id, achievement_id) VALUES (?, ?, ?)', [(0, uuid_1.v4)(), sessionId, achievement.id]);
                }
            }
        }
    }
    async checkAchievementCriteria(sessionId, criteria) {
        switch (criteria.type) {
            case 'streak':
                return await this.checkStreakCriteria(sessionId, criteria);
            case 'count':
                return await this.checkCountCriteria(sessionId, criteria);
            case 'first':
                return await this.checkFirstCriteria(sessionId, criteria);
            default:
                return false;
        }
    }
    async checkStreakCriteria(sessionId, criteria) {
        if (criteria.activity === 'mood_entry') {
            const entries = await this.db.all(`SELECT date FROM mood_entries 
         WHERE session_id = ? 
         ORDER BY date DESC`, [sessionId]);
            if (entries.length < criteria.days)
                return false;
            // Check for consecutive days
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < criteria.days; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                const checkDateStr = checkDate.toISOString().split('T')[0];
                const hasEntry = entries.some(entry => entry.date === checkDateStr);
                if (hasEntry) {
                    streak++;
                }
                else {
                    break;
                }
            }
            return streak >= criteria.days;
        }
        return false;
    }
    async checkCountCriteria(sessionId, criteria) {
        let count = 0;
        if (criteria.activity === 'chat') {
            const result = await this.db.get('SELECT COUNT(*) as count FROM activities WHERE session_id = ? AND type = ?', [sessionId, 'chat']);
            count = result?.count || 0;
        }
        else if (criteria.activity === 'resource') {
            const result = await this.db.get('SELECT COUNT(*) as count FROM activities WHERE session_id = ? AND type = ?', [sessionId, 'resource']);
            count = result?.count || 0;
        }
        return count >= criteria.count;
    }
    async checkFirstCriteria(sessionId, criteria) {
        const result = await this.db.get('SELECT COUNT(*) as count FROM activities WHERE session_id = ? AND type = ?', [sessionId, criteria.activity]);
        return (result?.count || 0) > 0;
    }
    // Progress metrics
    async getProgressMetrics(sessionId) {
        const [moodEntries, activities, riskAssessment] = await Promise.all([
            this.getMoodHistory(sessionId, 30),
            this.getAllActivities(sessionId, 100),
            this.getLatestRiskAssessment(sessionId)
        ]);
        // Calculate streak days
        const streakDays = await this.calculateMoodStreak(sessionId);
        // Calculate activity counts
        const chatSessions = activities.filter(a => a.type === 'chat').length;
        const resourcesAccessed = activities.filter(a => a.type === 'resource').length;
        const totalCheckIns = moodEntries.length;
        // Calculate average mood
        const averageMood = moodEntries.length > 0
            ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length)
            : 0;
        // Calculate mood trend (last 7 days vs previous 7 days)
        const recentEntries = moodEntries.slice(-7);
        const previousEntries = moodEntries.slice(-14, -7);
        const recentAvg = recentEntries.length > 0
            ? recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length
            : 0;
        const previousAvg = previousEntries.length > 0
            ? previousEntries.reduce((sum, entry) => sum + entry.mood, 0) / previousEntries.length
            : recentAvg;
        const moodTrend = Math.round(((recentAvg - previousAvg) / (previousAvg || 1)) * 100);
        // Calculate overall progress (based on various factors)
        const overallProgress = Math.min(100, Math.round((streakDays * 5) +
            (totalCheckIns * 2) +
            (chatSessions * 3) +
            (resourcesAccessed * 2) +
            (averageMood * 2)));
        return {
            overallProgress,
            streakDays,
            totalCheckIns,
            totalChatSessions: chatSessions,
            totalResourcesAccessed: resourcesAccessed,
            averageMood,
            moodTrend,
            riskLevel: riskAssessment?.overall_risk || 0
        };
    }
    async calculateMoodStreak(sessionId) {
        const entries = await this.db.all(`SELECT date FROM mood_entries 
       WHERE session_id = ? 
       ORDER BY date DESC`, [sessionId]);
        if (entries.length === 0)
            return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < entries.length; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const hasEntry = entries.some(entry => entry.date === checkDateStr);
            if (hasEntry) {
                streak++;
            }
            else {
                break;
            }
        }
        return streak;
    }
    async getLatestRiskAssessment(sessionId) {
        return await this.db.get(`SELECT * FROM risk_assessments 
       WHERE session_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`, [sessionId]);
    }
    // Progress Analytics Methods
    async getProgressAnalytics(sessionId, timeRange = '30d') {
        const days = this.parseTimeRange(timeRange);
        const moodHistory = await this.getMoodHistory(sessionId, days);
        const [correlations, patterns, weeklyPatterns, timePatterns] = await Promise.all([
            this.calculateCorrelations(moodHistory),
            this.identifyPatterns(sessionId, moodHistory),
            this.analyzeWeeklyPatterns(moodHistory),
            this.analyzeTimePatterns(moodHistory)
        ]);
        return {
            moodTrends: moodHistory,
            correlations,
            patterns,
            weeklyPatterns,
            timePatterns
        };
    }
    parseTimeRange(range) {
        switch (range) {
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            case '1y': return 365;
            default: return 30;
        }
    }
    async calculateCorrelations(moodHistory) {
        if (moodHistory.length < 5) {
            return []; // Need at least 5 data points for meaningful correlation
        }
        const correlations = [];
        // Sleep & Mood correlation
        const sleepMoodCorr = this.calculatePearsonCorrelation(moodHistory.map(e => e.sleep), moodHistory.map(e => e.mood));
        if (!isNaN(sleepMoodCorr)) {
            correlations.push({
                title: 'Sleep & Mood',
                correlation: sleepMoodCorr,
                description: `${Math.abs(sleepMoodCorr) > 0.7 ? 'Strong' : 'Moderate'} ${sleepMoodCorr > 0 ? 'positive' : 'negative'} correlation between sleep quality and mood`,
                insight: sleepMoodCorr > 0.5
                    ? 'Better sleep consistently leads to improved mood the following day'
                    : 'Sleep quality shows some relationship with mood patterns'
            });
        }
        // Energy & Stress correlation
        const energyStressCorr = this.calculatePearsonCorrelation(moodHistory.map(e => e.energy), moodHistory.map(e => e.stress));
        if (!isNaN(energyStressCorr)) {
            correlations.push({
                title: 'Energy & Stress',
                correlation: energyStressCorr,
                description: `${Math.abs(energyStressCorr) > 0.7 ? 'Strong' : 'Moderate'} ${energyStressCorr > 0 ? 'positive' : 'negative'} correlation between energy and stress levels`,
                insight: energyStressCorr < -0.5
                    ? 'Higher stress days correlate with lower energy levels'
                    : 'Stress and energy levels show some relationship'
            });
        }
        // Mood & Anxiety correlation
        const moodAnxietyCorr = this.calculatePearsonCorrelation(moodHistory.map(e => e.mood), moodHistory.map(e => e.anxiety));
        if (!isNaN(moodAnxietyCorr)) {
            correlations.push({
                title: 'Mood & Anxiety',
                correlation: moodAnxietyCorr,
                description: `${Math.abs(moodAnxietyCorr) > 0.7 ? 'Strong' : 'Moderate'} ${moodAnxietyCorr > 0 ? 'positive' : 'negative'} correlation between mood and anxiety levels`,
                insight: moodAnxietyCorr < -0.5
                    ? 'Better mood days tend to have lower anxiety levels'
                    : 'Mood and anxiety levels show some relationship'
            });
        }
        return correlations;
    }
    calculatePearsonCorrelation(x, y) {
        if (x.length !== y.length || x.length === 0)
            return NaN;
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return denominator === 0 ? NaN : numerator / denominator;
    }
    async identifyPatterns(sessionId, moodHistory) {
        const patterns = [];
        // Trend analysis
        if (moodHistory.length >= 7) {
            const recentWeek = moodHistory.slice(-7);
            const previousWeek = moodHistory.slice(-14, -7);
            if (previousWeek.length > 0) {
                const recentAvg = recentWeek.reduce((sum, e) => sum + e.mood, 0) / recentWeek.length;
                const previousAvg = previousWeek.reduce((sum, e) => sum + e.mood, 0) / previousWeek.length;
                const change = ((recentAvg - previousAvg) / previousAvg) * 100;
                patterns.push({
                    type: 'trend',
                    title: 'Weekly Mood Trend',
                    description: `Your mood has ${change > 0 ? 'improved' : 'declined'} by ${Math.abs(Math.round(change))}% this week`,
                    data: {
                        change,
                        recentAverage: Math.round(recentAvg * 10) / 10,
                        previousAverage: Math.round(previousAvg * 10) / 10
                    }
                });
            }
        }
        // Consistency pattern
        if (moodHistory.length >= 5) {
            const moodValues = moodHistory.map(e => e.mood);
            const variance = this.calculateVariance(moodValues);
            const isConsistent = variance < 2;
            patterns.push({
                type: 'consistency',
                title: 'Mood Consistency',
                description: `Your mood has been ${isConsistent ? 'relatively stable' : 'quite variable'} recently`,
                data: {
                    variance: Math.round(variance * 100) / 100,
                    isConsistent,
                    range: Math.max(...moodValues) - Math.min(...moodValues)
                }
            });
        }
        return patterns;
    }
    calculateVariance(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
    async analyzeWeeklyPatterns(moodHistory) {
        if (moodHistory.length === 0) {
            return {
                weekdayAverage: 0,
                weekendAverage: 0,
                bestDay: 'Monday',
                worstDay: 'Monday'
            };
        }
        const dayAverages = {
            'Sunday': [],
            'Monday': [],
            'Tuesday': [],
            'Wednesday': [],
            'Thursday': [],
            'Friday': [],
            'Saturday': []
        };
        // Group mood entries by day of week
        moodHistory.forEach(entry => {
            const date = new Date(entry.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            dayAverages[dayName].push(entry.mood);
        });
        // Calculate averages for each day
        const dayStats = {};
        Object.keys(dayAverages).forEach(day => {
            const moods = dayAverages[day];
            dayStats[day] = moods.length > 0
                ? moods.reduce((a, b) => a + b, 0) / moods.length
                : 0;
        });
        // Calculate weekday vs weekend averages
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const weekends = ['Saturday', 'Sunday'];
        const weekdayMoods = weekdays.flatMap(day => dayAverages[day]);
        const weekendMoods = weekends.flatMap(day => dayAverages[day]);
        const weekdayAverage = weekdayMoods.length > 0
            ? weekdayMoods.reduce((a, b) => a + b, 0) / weekdayMoods.length
            : 0;
        const weekendAverage = weekendMoods.length > 0
            ? weekendMoods.reduce((a, b) => a + b, 0) / weekendMoods.length
            : 0;
        // Find best and worst days
        const validDays = Object.entries(dayStats).filter(([_, avg]) => avg > 0);
        const bestDay = validDays.length > 0
            ? validDays.reduce((a, b) => a[1] > b[1] ? a : b)[0]
            : 'Monday';
        const worstDay = validDays.length > 0
            ? validDays.reduce((a, b) => a[1] < b[1] ? a : b)[0]
            : 'Monday';
        return {
            weekdayAverage: Math.round(weekdayAverage * 10) / 10,
            weekendAverage: Math.round(weekendAverage * 10) / 10,
            bestDay,
            worstDay
        };
    }
    async analyzeTimePatterns(moodHistory) {
        // For now, return empty array as we don't have time-of-day data
        // This could be enhanced if we start tracking mood entries with specific times
        return [];
    }
    // Initialize default tasks for new sessions
    async initializeDefaultTasks(sessionId) {
        const defaultTasks = [
            {
                title: 'Weekly Mental Health Check-in',
                description: 'Take your weekly assessment to track progress',
                dueDate: new Date().toISOString().split('T')[0], // Today
                priority: 'high',
                type: 'assessment'
            },
            {
                title: 'Practice Mindfulness',
                description: 'Daily 10-minute meditation session',
                dueDate: new Date().toISOString().split('T')[0], // Today
                priority: 'medium',
                type: 'mindfulness'
            }
        ];
        for (const task of defaultTasks) {
            await this.createTask(sessionId, task);
        }
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboardService.js.map