-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  primary_currency TEXT DEFAULT 'AOA',
  monthly_income DECIMAL(15,2),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Create account_type enum
CREATE TYPE public.account_type AS ENUM ('bank', 'wallet', 'cash', 'other');

-- Create accounts table
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type public.account_type NOT NULL DEFAULT 'bank',
  institution_name TEXT,
  currency TEXT NOT NULL DEFAULT 'AOA',
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_type enum
CREATE TYPE public.category_type AS ENUM ('expense', 'income');

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.category_type NOT NULL,
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transaction_type enum
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AOA',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  related_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount_limit DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- Create investment_type enum
CREATE TYPE public.investment_type AS ENUM ('term_deposit', 'bond_otnr', 'fund', 'real_estate', 'equity', 'other');

-- Create investments table
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  investment_type public.investment_type NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AOA',
  principal_amount DECIMAL(15,2) NOT NULL,
  start_date DATE NOT NULL,
  maturity_date DATE,
  institution_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interest_payment_frequency enum
CREATE TYPE public.interest_payment_frequency AS ENUM ('monthly', 'quarterly', 'semiannual', 'at_maturity');

-- Create term_deposits table
CREATE TABLE public.term_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  interest_rate_annual DECIMAL(5,2) NOT NULL,
  term_days INTEGER NOT NULL,
  interest_payment_frequency public.interest_payment_frequency NOT NULL DEFAULT 'at_maturity',
  tax_rate DECIMAL(5,2),
  auto_renew BOOLEAN DEFAULT FALSE
);

-- Create coupon_frequency enum
CREATE TYPE public.coupon_frequency AS ENUM ('semiannual', 'annual');

-- Create bond_otnrs table
CREATE TABLE public.bond_otnrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  isin TEXT,
  coupon_rate_annual DECIMAL(5,2) NOT NULL,
  coupon_frequency public.coupon_frequency NOT NULL DEFAULT 'semiannual',
  quantity INTEGER NOT NULL DEFAULT 1,
  face_value_per_unit DECIMAL(15,2) NOT NULL,
  custodian_institution TEXT
);

-- Create goal_status enum
CREATE TYPE public.goal_status AS ENUM ('in_progress', 'completed', 'cancelled');

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AOA',
  target_date DATE,
  current_saved_amount DECIMAL(15,2) DEFAULT 0,
  status public.goal_status DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goal_contributions table
CREATE TABLE public.goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insight_type enum
CREATE TYPE public.insight_type AS ENUM ('high_expense', 'budget_overrun', 'savings_opportunity', 'goal_progress', 'investment_maturity');

-- Create insights table
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type public.insight_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bond_otnrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for accounts
CREATE POLICY "Users can manage own accounts" ON public.accounts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for categories (including default categories)
CREATE POLICY "Users can view own and default categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for budgets
CREATE POLICY "Users can manage own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for investments
CREATE POLICY "Users can manage own investments" ON public.investments
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for term_deposits (via investment ownership)
CREATE POLICY "Users can manage own term deposits" ON public.term_deposits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.investments
      WHERE investments.id = term_deposits.investment_id
      AND investments.user_id = auth.uid()
    )
  );

-- RLS Policies for bond_otnrs (via investment ownership)
CREATE POLICY "Users can manage own bonds" ON public.bond_otnrs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.investments
      WHERE investments.id = bond_otnrs.investment_id
      AND investments.user_id = auth.uid()
    )
  );

-- RLS Policies for goals
CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for goal_contributions
CREATE POLICY "Users can manage own goal contributions" ON public.goal_contributions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = goal_contributions.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- RLS Policies for insights
CREATE POLICY "Users can manage own insights" ON public.insights
  FOR ALL USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update account balance after transaction
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE public.accounts SET current_balance = current_balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.accounts SET current_balance = current_balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE public.accounts SET current_balance = current_balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.account_id;
      IF NEW.related_account_id IS NOT NULL THEN
        UPDATE public.accounts SET current_balance = current_balance + NEW.amount, updated_at = NOW()
        WHERE id = NEW.related_account_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE public.accounts SET current_balance = current_balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.accounts SET current_balance = current_balance + OLD.amount, updated_at = NOW()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE public.accounts SET current_balance = current_balance + OLD.amount, updated_at = NOW()
      WHERE id = OLD.account_id;
      IF OLD.related_account_id IS NOT NULL THEN
        UPDATE public.accounts SET current_balance = current_balance - OLD.amount, updated_at = NOW()
        WHERE id = OLD.related_account_id;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for transaction balance updates
CREATE TRIGGER on_transaction_change
  AFTER INSERT OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

-- Function to update goal progress
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.goals 
    SET current_saved_amount = current_saved_amount + NEW.amount, updated_at = NOW()
    WHERE id = NEW.goal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.goals 
    SET current_saved_amount = current_saved_amount - OLD.amount, updated_at = NOW()
    WHERE id = OLD.goal_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for goal contribution updates
CREATE TRIGGER on_goal_contribution_change
  AFTER INSERT OR DELETE ON public.goal_contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_goal_progress();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default categories
INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
  (NULL, 'Alimentação', 'expense', 'utensils', '#ef4444', TRUE),
  (NULL, 'Transporte', 'expense', 'car', '#f97316', TRUE),
  (NULL, 'Saúde', 'expense', 'heart-pulse', '#ec4899', TRUE),
  (NULL, 'Educação', 'expense', 'graduation-cap', '#8b5cf6', TRUE),
  (NULL, 'Lazer', 'expense', 'gamepad-2', '#06b6d4', TRUE),
  (NULL, 'Renda/Aluguel', 'expense', 'home', '#84cc16', TRUE),
  (NULL, 'Serviços', 'expense', 'zap', '#eab308', TRUE),
  (NULL, 'Compras', 'expense', 'shopping-bag', '#f43f5e', TRUE),
  (NULL, 'Outros', 'expense', 'circle', '#6b7280', TRUE),
  (NULL, 'Salário', 'income', 'briefcase', '#22c55e', TRUE),
  (NULL, 'Freelance', 'income', 'laptop', '#3b82f6', TRUE),
  (NULL, 'Investimentos', 'income', 'trending-up', '#14b8a6', TRUE),
  (NULL, 'Renda de Imóvel', 'income', 'building', '#a855f7', TRUE),
  (NULL, 'Outros', 'income', 'circle', '#6b7280', TRUE);