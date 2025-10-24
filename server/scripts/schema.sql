-- Create a tiny schema for analytics events.
CREATE TABLE IF NOT EXISTS events (
id SERIAL PRIMARY KEY,
user_id TEXT NOT NULL,
type TEXT NOT NULL,
metadata JSONB DEFAULT '{}'::jsonb,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Useful indexes for simple analytics
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events (user_id);