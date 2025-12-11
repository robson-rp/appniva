-- Create scenarios table for financial simulations
CREATE TABLE public.scenarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    monthly_income_estimate NUMERIC NOT NULL DEFAULT 0,
    monthly_expense_estimate NUMERIC NOT NULL DEFAULT 0,
    salary_increase_rate NUMERIC NOT NULL DEFAULT 0,
    investment_return_rate NUMERIC NOT NULL DEFAULT 0,
    inflation_rate NUMERIC NOT NULL DEFAULT 0,
    exchange_rate_projection NUMERIC NULL,
    time_horizon_years INTEGER NOT NULL DEFAULT 10,
    future_expenses JSONB NULL DEFAULT '[]'::jsonb,
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage own scenarios" 
ON public.scenarios 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_scenarios_user_id ON public.scenarios(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenarios_updated_at
BEFORE UPDATE ON public.scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();