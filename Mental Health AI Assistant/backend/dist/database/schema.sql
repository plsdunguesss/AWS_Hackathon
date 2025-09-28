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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_session_id ON risk_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_overall_risk ON risk_assessments(overall_risk);
CREATE INDEX IF NOT EXISTS idx_risk_indicators_message_id ON risk_indicators(message_id);
CREATE INDEX IF NOT EXISTS idx_safety_flags_message_id ON safety_flags(message_id);