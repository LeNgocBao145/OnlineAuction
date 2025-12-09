-- Add OAuth columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255),
ALTER COLUMN hashed_password DROP NOT NULL;

-- Add index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON users(oauth_provider, oauth_provider_id);
