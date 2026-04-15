-- Enable extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  content TEXT
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notes
CREATE POLICY "Users can view their notes"
ON notes
FOR SELECT
USING (user_id = current_setting('app.current_user')::uuid);

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert their notes"
ON notes
FOR INSERT
WITH CHECK (user_id = current_setting('app.current_user')::uuid);

-- Seed test users
INSERT INTO users (id, email)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'user1@test.com'),
  ('22222222-2222-2222-2222-222222222222', 'user2@test.com');
