-- Create recurring transactions table
CREATE TABLE public.recurring_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type public.transaction_type NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_execution_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own recurring transactions"
ON public.recurring_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions"
ON public.recurring_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
ON public.recurring_transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
ON public.recurring_transactions FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_recurring_transactions_updated_at
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Add index for efficient querying
CREATE INDEX idx_recurring_transactions_next_execution 
ON public.recurring_transactions(next_execution_date, is_active) 
WHERE is_active = true;