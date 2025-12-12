-- Create enum for product types
CREATE TYPE public.financial_product_type AS ENUM ('term_deposit', 'insurance', 'microcredit', 'fund');

-- Create enum for request status
CREATE TYPE public.product_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Create financial products table (public catalog)
CREATE TABLE public.financial_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  product_type public.financial_product_type NOT NULL,
  institution_name TEXT NOT NULL,
  interest_rate_annual NUMERIC,
  min_amount NUMERIC NOT NULL DEFAULT 0,
  max_amount NUMERIC,
  term_min_days INTEGER,
  term_max_days INTEGER,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  currency TEXT NOT NULL DEFAULT 'AOA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product requests table (user applications)
CREATE TABLE public.product_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.financial_products(id) ON DELETE CASCADE NOT NULL,
  status public.product_request_status NOT NULL DEFAULT 'pending',
  requested_amount NUMERIC NOT NULL,
  requested_term_days INTEGER,
  notes TEXT,
  response_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

-- Products are publicly viewable (catalog)
CREATE POLICY "Anyone can view active products"
ON public.financial_products
FOR SELECT
USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products"
ON public.financial_products
FOR ALL
USING (public.is_admin(auth.uid()));

-- Users can manage their own requests
CREATE POLICY "Users can manage own requests"
ON public.product_requests
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.product_requests
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can update request status
CREATE POLICY "Admins can update requests"
ON public.product_requests
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Create updated_at trigger for products
CREATE TRIGGER update_financial_products_updated_at
BEFORE UPDATE ON public.financial_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create updated_at trigger for requests
CREATE TRIGGER update_product_requests_updated_at
BEFORE UPDATE ON public.product_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert sample products
INSERT INTO public.financial_products (name, product_type, institution_name, interest_rate_annual, min_amount, max_amount, term_min_days, term_max_days, description, features) VALUES
('DP Premium 12M', 'term_deposit', 'Banco BAI', 14.5, 100000, 50000000, 365, 365, 'Depósito a prazo com taxa competitiva', '["Renovação automática", "Juros mensais ou no vencimento"]'),
('DP Flex 6M', 'term_deposit', 'BFA', 12.0, 50000, 20000000, 180, 180, 'Depósito flexível de 6 meses', '["Levantamento antecipado com penalização", "Taxa fixa"]'),
('DP Crescente', 'term_deposit', 'Banco Económico', 15.0, 200000, 100000000, 365, 730, 'Taxa crescente ao longo do prazo', '["Taxa progressiva", "Ideal para longo prazo"]'),
('Seguro Vida Familiar', 'insurance', 'ENSA', NULL, 5000, 100000, NULL, NULL, 'Proteção completa para toda a família', '["Cobertura morte natural", "Cobertura acidentes", "Assistência funeral"]'),
('Seguro Auto Completo', 'insurance', 'AAA Seguros', NULL, 15000, 500000, 365, 365, 'Seguro automóvel com cobertura total', '["Responsabilidade civil", "Danos próprios", "Assistência em viagem"]'),
('Microcrédito Empreendedor', 'microcredit', 'KixiCrédito', 28.0, 50000, 2000000, 90, 365, 'Financiamento para pequenos negócios', '["Aprovação rápida", "Sem garantias complexas", "Parcelas flexíveis"]'),
('Microcrédito Pessoal', 'microcredit', 'Banco Sol', 32.0, 20000, 500000, 30, 180, 'Crédito pessoal rápido', '["Aprovação em 24h", "Documentação mínima"]'),
('Fundo Monetário AOA', 'fund', 'BAI Gestão de Activos', 8.5, 10000, NULL, NULL, NULL, 'Fundo de baixo risco em kwanzas', '["Liquidez diária", "Baixo risco", "Gestão profissional"]'),
('Fundo Acções Angola', 'fund', 'BFA Capital', 12.0, 100000, NULL, NULL, NULL, 'Fundo de investimento em acções angolanas', '["Potencial de valorização", "Diversificação", "Risco moderado"]');