
-- Add the missing columns to payment_methods table
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS account_number text,
ADD COLUMN IF NOT EXISTS routing_number text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS phone_number text;

-- Fix admin_users table structure and policies
DROP POLICY IF EXISTS "Allow admin registration" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can view all admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can update admin records" ON public.admin_users;

-- Recreate admin_users table with proper structure if needed
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  password TEXT,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies that allow admin registration without authentication
CREATE POLICY "Allow public admin registration" 
  ON public.admin_users 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Allow authenticated users to view their own records
CREATE POLICY "Users can view own admin record" 
  ON public.admin_users 
  FOR SELECT 
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow superadmins to view and update all admin records
CREATE POLICY "Superadmins can manage all admin records" 
  ON public.admin_users 
  FOR ALL 
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Allow public read access for superadmin dashboard
CREATE POLICY "Public read for superadmin dashboard" 
  ON public.admin_users 
  FOR SELECT 
  TO public
  USING (true);
