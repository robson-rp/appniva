-- =============================================
-- EXCHANGE RATES - Taxas de Câmbio em Tempo Real
-- =============================================

-- Table for storing exchange rates
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  target_currency TEXT NOT NULL,
  rate NUMERIC(20, 8) NOT NULL,
  source TEXT DEFAULT 'manual',
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user exchange rate alerts
CREATE TABLE public.exchange_rate_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  target_currency TEXT NOT NULL DEFAULT 'AOA',
  threshold_rate NUMERIC(20, 8) NOT NULL,
  alert_direction TEXT NOT NULL CHECK (alert_direction IN ('above', 'below')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- KIXIKILA/STOKVEL - Poupanças Comunitárias
-- =============================================

-- Main kixikila groups table
CREATE TABLE public.kixikilas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  contribution_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AOA',
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL,
  total_members INTEGER NOT NULL DEFAULT 1,
  current_round INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Members of kixikila groups
CREATE TABLE public.kixikila_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kixikila_id UUID NOT NULL REFERENCES public.kixikilas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  order_number INTEGER NOT NULL,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contributions made by members
CREATE TABLE public.kixikila_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kixikila_id UUID NOT NULL REFERENCES public.kixikilas(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.kixikila_members(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INFLATION - Alertas de Inflação
-- =============================================

CREATE TABLE public.inflation_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL DEFAULT 'AO',
  month TEXT NOT NULL, -- Format: YYYY-MM
  annual_rate NUMERIC(8, 4) NOT NULL, -- Annual inflation rate percentage
  monthly_rate NUMERIC(8, 4), -- Monthly inflation rate percentage
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country, month)
);

-- =============================================
-- REMITTANCES - Remessas da Diáspora
-- =============================================

CREATE TABLE public.remittances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_country TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  amount_sent NUMERIC(15, 2) NOT NULL,
  currency_from TEXT NOT NULL,
  amount_received NUMERIC(15, 2) NOT NULL,
  currency_to TEXT NOT NULL DEFAULT 'AOA',
  exchange_rate NUMERIC(20, 8) NOT NULL,
  service_provider TEXT NOT NULL,
  fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SCHOOL FEES - Propinas Escolares
-- =============================================

CREATE TABLE public.school_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  education_level TEXT NOT NULL CHECK (education_level IN ('pre_school', 'primary', 'secondary', 'university', 'vocational', 'other')),
  fee_type TEXT NOT NULL CHECK (fee_type IN ('tuition', 'registration', 'materials', 'transport', 'uniform', 'meals', 'other')),
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AOA',
  academic_year TEXT NOT NULL,
  term TEXT CHECK (term IN ('1', '2', '3', 'annual')),
  due_date DATE NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE,
  account_id UUID REFERENCES public.accounts(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SPLIT EXPENSES - Divisão de Despesas
-- =============================================

CREATE TABLE public.split_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AOA',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.split_expense_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.split_expenses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  amount_owed NUMERIC(15, 2) NOT NULL,
  amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Exchange Rates (public read, admin write)
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exchange rates are viewable by everyone" ON public.exchange_rates FOR SELECT USING (true);

-- Exchange Rate Alerts
ALTER TABLE public.exchange_rate_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own alerts" ON public.exchange_rate_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own alerts" ON public.exchange_rate_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.exchange_rate_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.exchange_rate_alerts FOR DELETE USING (auth.uid() = user_id);

-- Kixikilas
ALTER TABLE public.kixikilas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own kixikilas" ON public.kixikilas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create kixikilas" ON public.kixikilas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own kixikilas" ON public.kixikilas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own kixikilas" ON public.kixikilas FOR DELETE USING (auth.uid() = user_id);

-- Kixikila Members
ALTER TABLE public.kixikila_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view members of their kixikilas" ON public.kixikila_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.kixikilas WHERE id = kixikila_id AND user_id = auth.uid()));
CREATE POLICY "Users can add members to their kixikilas" ON public.kixikila_members FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.kixikilas WHERE id = kixikila_id AND user_id = auth.uid()));
CREATE POLICY "Users can update members of their kixikilas" ON public.kixikila_members FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.kixikilas WHERE id = kixikila_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete members of their kixikilas" ON public.kixikila_members FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.kixikilas WHERE id = kixikila_id AND user_id = auth.uid()));

-- Kixikila Contributions
ALTER TABLE public.kixikila_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view contributions of their kixikilas" ON public.kixikila_contributions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.kixikilas WHERE id = kixikila_id AND user_id = auth.uid()));
CREATE POLICY "Users can add contributions to their kixikilas" ON public.kixikila_contributions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.kixikilas WHERE id = kixikila_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete contributions from their kixikilas" ON public.kixikila_contributions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.kixikilas WHERE id = kixikila_id AND user_id = auth.uid()));

-- Inflation Rates (public read)
ALTER TABLE public.inflation_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inflation rates are viewable by everyone" ON public.inflation_rates FOR SELECT USING (true);

-- Remittances
ALTER TABLE public.remittances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own remittances" ON public.remittances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create remittances" ON public.remittances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own remittances" ON public.remittances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own remittances" ON public.remittances FOR DELETE USING (auth.uid() = user_id);

-- School Fees
ALTER TABLE public.school_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own school fees" ON public.school_fees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create school fees" ON public.school_fees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own school fees" ON public.school_fees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own school fees" ON public.school_fees FOR DELETE USING (auth.uid() = user_id);

-- Split Expenses
ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own split expenses" ON public.split_expenses FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can create split expenses" ON public.split_expenses FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own split expenses" ON public.split_expenses FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own split expenses" ON public.split_expenses FOR DELETE USING (auth.uid() = creator_id);

-- Split Expense Participants
ALTER TABLE public.split_expense_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view participants of their expenses" ON public.split_expense_participants FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.split_expenses WHERE id = expense_id AND creator_id = auth.uid()));
CREATE POLICY "Users can add participants to their expenses" ON public.split_expense_participants FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.split_expenses WHERE id = expense_id AND creator_id = auth.uid()));
CREATE POLICY "Users can update participants of their expenses" ON public.split_expense_participants FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.split_expenses WHERE id = expense_id AND creator_id = auth.uid()));
CREATE POLICY "Users can delete participants from their expenses" ON public.split_expense_participants FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.split_expenses WHERE id = expense_id AND creator_id = auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_exchange_rate_alerts_updated_at
  BEFORE UPDATE ON public.exchange_rate_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_kixikilas_updated_at
  BEFORE UPDATE ON public.kixikilas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_remittances_updated_at
  BEFORE UPDATE ON public.remittances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_school_fees_updated_at
  BEFORE UPDATE ON public.school_fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_split_expenses_updated_at
  BEFORE UPDATE ON public.split_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_split_expense_participants_updated_at
  BEFORE UPDATE ON public.split_expense_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();