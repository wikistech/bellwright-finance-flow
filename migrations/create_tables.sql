
-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  cardholderName TEXT NOT NULL,
  cardNumber TEXT NOT NULL,
  paymentType TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create loan applications table
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  loanType TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  term INTEGER NOT NULL,
  fullName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  employment TEXT NOT NULL,
  income NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for loan applications table
CREATE POLICY "Users can view their own loan applications" 
  ON public.loan_applications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan applications" 
  ON public.loan_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all data (you would implement proper admin checks in a real app)
-- This is just for demonstration purposes
CREATE POLICY "Admins can view all payments" 
  ON public.payments 
  FOR SELECT 
  USING (pg_has_role(auth.uid(), 'admin', 'member'));

CREATE POLICY "Admins can view all loan applications" 
  ON public.loan_applications 
  FOR SELECT 
  USING (pg_has_role(auth.uid(), 'admin', 'member'));
