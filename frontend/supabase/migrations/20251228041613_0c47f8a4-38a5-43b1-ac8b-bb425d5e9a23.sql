-- Create table to store user mobile home preferences
CREATE TABLE public.user_mobile_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  selected_features TEXT[] NOT NULL DEFAULT ARRAY['accounts', 'transactions', 'budgets', 'investments', 'goals', 'school-fees', 'subscriptions', 'debts', 'dashboard', 'insights', 'assistant', 'simulator'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_mobile_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own preferences"
ON public.user_mobile_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_mobile_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_mobile_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_mobile_preferences_updated_at
BEFORE UPDATE ON public.user_mobile_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();