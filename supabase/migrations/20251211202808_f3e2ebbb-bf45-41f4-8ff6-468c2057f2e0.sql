-- Create table for category prediction logs
CREATE TABLE public.category_prediction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  predicted_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  description TEXT NOT NULL,
  accepted BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.category_prediction_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage own prediction logs
CREATE POLICY "Users can manage own prediction logs"
ON public.category_prediction_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = category_prediction_logs.transaction_id
    AND transactions.user_id = auth.uid()
  )
  OR transaction_id IS NULL
);

-- Create policy for inserting prediction logs (before transaction exists)
CREATE POLICY "Users can insert prediction logs"
ON public.category_prediction_logs
FOR INSERT
WITH CHECK (true);

-- Add index for performance
CREATE INDEX idx_prediction_logs_transaction ON public.category_prediction_logs(transaction_id);
CREATE INDEX idx_prediction_logs_category ON public.category_prediction_logs(predicted_category_id);