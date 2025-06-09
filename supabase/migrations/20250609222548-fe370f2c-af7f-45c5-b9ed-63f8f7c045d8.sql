
-- Enable RLS on admin_users table if not already enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert new admin registration (pending status)
CREATE POLICY "Allow admin registration" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (status = 'pending');

-- Create policy to allow users to view their own admin record
CREATE POLICY "Users can view own admin record" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow superadmins to view all admin records
CREATE POLICY "Superadmins can view all admin records" 
  ON public.admin_users 
  FOR SELECT 
  USING (public.is_superadmin());

-- Create policy to allow superadmins to update admin records (for approval/rejection)
CREATE POLICY "Superadmins can update admin records" 
  ON public.admin_users 
  FOR UPDATE 
  USING (public.is_superadmin());
