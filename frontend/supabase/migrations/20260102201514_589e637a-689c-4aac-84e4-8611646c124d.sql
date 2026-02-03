-- Fix search_path for calculate_maturity_level function
CREATE OR REPLACE FUNCTION public.calculate_maturity_level(
  p_uses_budget BOOLEAN,
  p_has_investments BOOLEAN,
  p_has_debts BOOLEAN
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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