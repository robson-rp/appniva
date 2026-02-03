-- Create enum for reconciliation status
CREATE TYPE public.reconciliation_status AS ENUM ('matched', 'mismatched', 'pending');

-- Create bank_reconciliations table
CREATE TABLE public.bank_reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  external_amount NUMERIC NOT NULL,
  external_description TEXT,
  external_date DATE,
  status reconciliation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own reconciliations"
ON public.bank_reconciliations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_bank_reconciliations_updated_at
BEFORE UPDATE ON public.bank_reconciliations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();