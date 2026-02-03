-- Add admin read policies to main tables

-- Accounts: Allow admins to view all accounts
CREATE POLICY "Admins can view all accounts"
ON public.accounts
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Transactions: Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Debts: Allow admins to view all debts
CREATE POLICY "Admins can view all debts"
ON public.debts
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Investments: Allow admins to view all investments
CREATE POLICY "Admins can view all investments"
ON public.investments
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Goals: Allow admins to view all goals
CREATE POLICY "Admins can view all goals"
ON public.goals
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Budgets: Allow admins to view all budgets
CREATE POLICY "Admins can view all budgets"
ON public.budgets
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Financial scores: Allow admins to view all scores
CREATE POLICY "Admins can view all financial scores"
ON public.financial_scores
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Insights: Allow admins to view all insights
CREATE POLICY "Admins can view all insights"
ON public.insights
FOR SELECT
USING (public.is_admin(auth.uid()));