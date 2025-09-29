-- Mental Health AI Assistant Database Schema

-- User sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    risk_score REAL DEFAULT 0.0,
    referral_triggered BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for conversation history
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    empathy_score REAL DEFAULT 0.0,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Risk assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    message_id TEXT,
    overall_risk REAL NOT NULL,
    depression_markers REAL DEFAULT 0.0,
    anxiety_markers REAL DEFAULT 0.0,
    self_harm_risk REAL DEFAULT 0.0,
    suicidal_ideation REAL DEFAULT 0.0,
    social_isolation REAL DEFAULT 0.0,
    confidence REAL DEFAULT 0.0,
    recommends_professional_help BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Risk indicators table for detailed tracking
CREATE TABLE IF NOT EXISTS risk_indicators (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    indicator_type TEXT NOT NULL,
    indicator_value TEXT NOT NULL,
    severity REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Safety flags table for content monitoring
CREATE TABLE IF NOT EXISTS safety_flags (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    contains_harmful_content BOOLEAN DEFAULT FALSE,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'crisis')),
    flagged_terms TEXT, -- JSON array of flagged terms
    requires_intervention BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Mood entries table for tracking user mood over time
CREATE TABLE IF NOT EXISTS mood_entries (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    date DATE NOT NULL,
    mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
    energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 10),
    stress INTEGER NOT NULL CHECK (stress >= 1 AND stress <= 10),
    anxiety INTEGER NOT NULL CHECK (anxiety >= 1 AND anxiety <= 10),
    sleep INTEGER NOT NULL CHECK (sleep >= 1 AND sleep <= 10),
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Activities table for tracking user activities
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('chat', 'assessment', 'resource', 'professional')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON string for additional data
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Achievements table for user milestones
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    criteria TEXT NOT NULL -- JSON string describing achievement criteria
);

-- User achievements table for tracking earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(session_id, achievement_id)
);

-- Tasks table for upcoming tasks and reminders
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    type TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    bio TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'America/New_York',
    reminder_time TEXT DEFAULT '09:00',
    weekly_report_day TEXT DEFAULT 'sunday',
    -- Notification preferences (stored as JSON)
    notifications TEXT DEFAULT '{"checkInReminders": true, "chatNotifications": true, "appointmentReminders": true, "weeklyReports": false, "emergencyAlerts": true, "marketingEmails": false}',
    -- Privacy preferences (stored as JSON)
    privacy TEXT DEFAULT '{"dataSharing": false, "anonymousResearch": true, "profileVisibility": "private", "activityTracking": true}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Insert default achievements
INSERT OR IGNORE INTO achievements (id, title, description, icon, category, criteria) VALUES
('7-day-streak', '7-Day Streak', 'Completed daily check-ins for a week', 'Award', 'consistency', '{"type": "streak", "days": 7, "activity": "mood_entry"}'),
('mindfulness-master', 'Mindfulness Master', 'Completed 10 mindfulness exercises', 'Heart', 'wellness', '{"type": "count", "count": 10, "activity": "resource", "subtype": "mindfulness"}'),
('assessment-champion', 'Assessment Champion', 'Completed first mental health assessment', 'BarChart3', 'progress', '{"type": "first", "activity": "assessment"}'),
('support-seeker', 'Support Seeker', 'Connected with a mental health professional', 'Users', 'support', '{"type": "first", "activity": "professional"}'),
('chat-companion', 'Chat Companion', 'Had 5 conversations with the AI assistant', 'MessageCircle', 'engagement', '{"type": "count", "count": 5, "activity": "chat"}'),
('progress-tracker', 'Progress Tracker', 'Tracked mood for 30 days', 'TrendingUp', 'consistency', '{"type": "streak", "days": 30, "activity": "mood_entry"}');

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_user_profiles_session_id ON user_profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_session_id ON user_preferences(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_session_id ON risk_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_overall_risk ON risk_assessments(overall_risk);
CREATE INDEX IF NOT EXISTS idx_risk_indicators_message_id ON risk_indicators(message_id);
CREATE INDEX IF NOT EXISTS idx_safety_flags_message_id ON safety_flags(message_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_session_id ON mood_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date);
CREATE INDEX IF NOT EXISTS idx_activities_session_id ON activities(session_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_achievements_session_id ON user_achievements(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_session_id ON tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);