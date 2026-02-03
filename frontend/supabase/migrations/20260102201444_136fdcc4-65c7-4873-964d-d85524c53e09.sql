-- Create user_maturity_profiles table
CREATE TABLE public.user_maturity_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'basic' CHECK (level IN ('basic', 'intermediate', 'advanced')),
  has_fixed_income BOOLEAN DEFAULT NULL,
  uses_budget BOOLEAN DEFAULT NULL,
  has_debts BOOLEAN DEFAULT NULL,
  has_investments BOOLEAN DEFAULT NULL,
  primary_goal TEXT DEFAULT NULL CHECK (primary_goal IN ('control_expenses', 'save', 'pay_debts', 'invest_better')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  progress_steps_completed INTEGER NOT NULL DEFAULT 0,
  total_progress_steps INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_maturity_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own maturity profile"
ON public.user_maturity_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maturity profile"
ON public.user_maturity_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maturity profile"
ON public.user_maturity_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_maturity_profiles_updated_at
BEFORE UPDATE ON public.user_maturity_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create function to calculate maturity level
CREATE OR REPLACE FUNCTION public.calculate_maturity_level(
  p_uses_budget BOOLEAN,
  p_has_investments BOOLEAN,
  p_has_debts BOOLEAN
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Advanced: has investments and either uses budget or manages debts
  IF p_has_investments AND (p_uses_budget OR p_has_debts) THEN
    RETURN 'advanced';
  END IF;
  
  -- Intermediate: uses budget or has investments
  IF p_uses_budget OR p_has_investments THEN
    RETURN 'intermediate';
  END IF;
  
  -- Basic: default level
  RETURN 'basic';
END;
$$;