
-- Add columns for expiry date, CVV, and payment PIN to the payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS expiry_date TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS cvv TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_pin TEXT;
