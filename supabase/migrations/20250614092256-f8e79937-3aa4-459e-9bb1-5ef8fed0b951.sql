
-- Drop the policy if it exists to prevent errors if run multiple times
DROP POLICY IF EXISTS "Admins can read their own admin record" ON public.admin_users;

-- Create a policy that allows an authenticated user to read their own record
-- from the admin_users table. The 'id' column in admin_users should store
-- the Supabase auth.uid() of the admin.
CREATE POLICY "Admins can read their own admin record"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = id);

