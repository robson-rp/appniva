-- Create enums for debt types
CREATE TYPE public.debt_type AS ENUM ('personal', 'mortgage', 'car', 'credit_card', 'student', 'other');
CREATE TYPE public.debt_status AS ENUM ('active', 'closed');
CREATE TYPE public.installment_frequency AS ENUM ('monthly', 'quarterly', 'semiannual', 'annual');

-- Create debts table
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  principal_amount NUMERIC NOT NULL,
  current_balance NUMERIC NOT NULL,
  interest_rate_annual NUMERIC NOT NULL DEFAULT 0,
  installment_amount NUMERIC NOT NULL,
  installment_frequency installment_frequency NOT NULL DEFAULT 'monthly',
  next_payment_date DATE,
  institution TEXT,
  type debt_type NOT NULL DEFAULT 'personal',
  status debt_status NOT NULL DEFAULT 'active',
  currency TEXT NOT NULL DEFAULT 'AOA',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create debt_payments table to track payments
CREATE TABLE public.debt_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for debts
CREATE POLICY "Users can manage own debts" 
ON public.debts 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for debt_payments
CREATE POLICY "Users can manage own debt payments" 
ON public.debt_payments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.debts 
  WHERE debts.id = debt_payments.debt_id 
  AND debts.user_id = auth.uid()
));

-- Trigger to update debt balance after payment
CREATE OR REPLACE FUNCTION public.update_debt_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.debts 
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.debt_id;
    
    -- Check if debt is paid off
    UPDATE public.debts 
    SET status = 'closed'
    WHERE id = NEW.debt_id AND current_balance <= 0;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.debts 
    SET current_balance = current_balance + OLD.amount,
        updated_at = NOW(),
        status = 'active'
    WHERE id = OLD.debt_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_debt_balance_trigger
AFTER INSERT OR DELETE ON public.debt_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_debt_balance();

-- Trigger to update updated_at
CREATE TRIGGER update_debts_updated_at
BEFORE UPDATE ON public.debts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create indexes
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_debts_status ON public.debts(status);
CREATE INDEX idx_debts_next_payment ON public.debts(next_payment_date);
CREATE INDEX idx_debt_payments_debt_id ON public.debt_payments(debt_id);