-- Add role-based access column to users and align existing is_admin flag
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'viewer'
  CHECK (role IN ('owner', 'admin', 'editor', 'viewer'));

-- Promote existing admins
UPDATE public.users
SET role = 'admin'
WHERE is_admin IS TRUE;

-- Optional: index for lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
