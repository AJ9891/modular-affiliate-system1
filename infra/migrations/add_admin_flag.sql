-- Add admin flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Add comment
COMMENT ON COLUMN users.is_admin IS 'Admin flag for users who can access admin features like credit topup and analytics';

-- Example: Set a specific user as admin (replace with your actual admin UUID)
-- UPDATE users SET is_admin = TRUE WHERE id = 'your-admin-uuid-here';

-- To get your user ID, run:
-- SELECT id, email FROM users WHERE email = 'your@email.com';
