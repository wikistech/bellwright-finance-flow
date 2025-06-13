
-- Create payments table to store payment transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  cardholder_name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'deposit',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" 
  ON public.payments 
  FOR SELECT 
  USING (public.is_admin());

-- Update payment_methods table to ensure it works with auth
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_methods if they don't exist
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can create their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can view all payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their own payment methods" 
  ON public.payment_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment methods" 
  ON public.payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment methods" 
  ON public.payment_methods 
  FOR SELECT 
  USING (public.is_admin());
