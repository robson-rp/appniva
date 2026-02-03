-- Create financial_scores table
CREATE TABLE public.financial_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_financial_scores_user_id ON public.financial_scores(user_id);
CREATE INDEX idx_financial_scores_generated_at ON public.financial_scores(generated_at DESC);

-- Enable RLS
ALTER TABLE public.financial_scores ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see their own scores
CREATE POLICY "Users can manage own financial scores"
ON public.financial_scores
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);