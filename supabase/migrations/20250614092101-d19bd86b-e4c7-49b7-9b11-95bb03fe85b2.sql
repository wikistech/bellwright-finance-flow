
-- Ensure Row Level Security is enabled on the admin_users table.
-- It's safe to run this command even if RLS is already enabled.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for admin_users if they exist, to avoid conflicts.
-- Adjust policy names if they are different in your project.
-- It's okay if these policies don't exist; the command will just be skipped.
DROP POLICY IF EXISTS "Superadmins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can delete admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin users to read their own data" ON public.admin_users; -- Common other policy
DROP POLICY IF EXISTS "Allow all authenticated to read" ON public.admin_users; -- Another common one

-- Policy: Superadmins can view all admin user records.
CREATE POLICY "Superadmins can view all admin users"
  ON public.admin_users FOR SELECT
  USING (public.is_superadmin());

-- Policy: Superadmins can update admin user records.
CREATE POLICY "Superadmins can update admin users"
  ON public.admin_users FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Policy: Superadmins can delete admin user records.
CREATE POLICY "Superadmins can delete admin users"
  ON public.admin_users FOR DELETE
  USING (public.is_superadmin());

