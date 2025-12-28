-- Add source column to transactions table to identify automatic transactions
ALTER TABLE public.transactions 
ADD COLUMN source text DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.transactions.source IS 'Identifies the module that created the transaction: debt_payment, school_fee, remittance, kixikila, goal_contribution, investment, subscription, or NULL for manual transactions';