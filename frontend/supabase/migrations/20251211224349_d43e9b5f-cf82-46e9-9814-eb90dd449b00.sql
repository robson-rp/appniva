-- Create cost_center_budgets table
CREATE TABLE public.cost_center_budgets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    cost_center_id UUID NOT NULL REFERENCES public.cost_centers(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    amount_limit NUMERIC NOT NULL,
    alert_threshold NUMERIC DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(cost_center_id, month)
);

-- Enable RLS
ALTER TABLE public.cost_center_budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own cost center budgets"
ON public.cost_center_budgets
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_cost_center_budgets_updated_at
BEFORE UPDATE ON public.cost_center_budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();