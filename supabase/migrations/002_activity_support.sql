-- Add activity support columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS main_activities TEXT[] DEFAULT '{"gym"}',
  ADD COLUMN IF NOT EXISTS addon_activities JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS activity_preference TEXT DEFAULT 'flexible';
