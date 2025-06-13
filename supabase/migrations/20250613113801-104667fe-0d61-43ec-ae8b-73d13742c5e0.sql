
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can view all payment methods" ON public.payment_methods;

-- Create correct RLS policies for payment_methods
CREATE POLICY "Users can insert their own payment methods" 
ON public.payment_methods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
ON public.payment_methods 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" 
ON public.payment_methods 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add admin policies for payment_methods
CREATE POLICY "Admins can view all payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (public.is_admin());

-- Fix admin_users table foreign key constraint by removing it
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_id_fkey;

-- Enable RLS on admin_users if not already enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing admin_users policies if they exist
DROP POLICY IF EXISTS "Superadmins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can insert admin registration" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can delete admin users" ON public.admin_users;

-- Create admin_users policies
CREATE POLICY "Superadmins can view all admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.is_superadmin());

CREATE POLICY "Anyone can insert admin registration" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Superadmins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (public.is_superadmin());

CREATE POLICY "Superadmins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (public.is_superadmin());

-- Enable RLS on loan_applications if not already enabled
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing loan_applications policies if they exist
DROP POLICY IF EXISTS "Users can view their own loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Users can insert their own loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Admins can view all loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Admins can update loan applications" ON public.loan_applications;

-- Create loan_applications policies
CREATE POLICY "Users can view their own loan applications" 
ON public.loan_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan applications" 
ON public.loan_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all loan applications" 
ON public.loan_applications 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update loan applications" 
ON public.loan_applications 
FOR UPDATE 
USING (public.is_admin());
