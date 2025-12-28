-- Create participant groups table
CREATE TABLE public.participant_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participant group members table
CREATE TABLE public.participant_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.participant_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment history table
CREATE TABLE public.split_expense_payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.split_expense_participants(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add receipt_url to split_expenses
ALTER TABLE public.split_expenses ADD COLUMN receipt_url TEXT;

-- Add share_token for public sharing
ALTER TABLE public.split_expenses ADD COLUMN share_token TEXT UNIQUE;

-- Enable RLS
ALTER TABLE public.participant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_expense_payment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for participant_groups
CREATE POLICY "Users can manage own groups" ON public.participant_groups
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for participant_group_members
CREATE POLICY "Users can manage members of their groups" ON public.participant_group_members
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.participant_groups 
    WHERE participant_groups.id = participant_group_members.group_id 
    AND participant_groups.user_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM public.participant_groups 
    WHERE participant_groups.id = participant_group_members.group_id 
    AND participant_groups.user_id = auth.uid()
  ));

-- RLS policies for payment history
CREATE POLICY "Users can manage payment history of their expenses" ON public.split_expense_payment_history
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.split_expense_participants sep
    JOIN public.split_expenses se ON se.id = sep.expense_id
    WHERE sep.id = split_expense_payment_history.participant_id 
    AND se.creator_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM public.split_expense_participants sep
    JOIN public.split_expenses se ON se.id = sep.expense_id
    WHERE sep.id = split_expense_payment_history.participant_id 
    AND se.creator_id = auth.uid()
  ));

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('expense-receipts', 'expense-receipts', true);

-- Storage policies for expense receipts
CREATE POLICY "Users can upload expense receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view expense receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'expense-receipts');

CREATE POLICY "Users can update their expense receipts" ON storage.objects
  FOR UPDATE USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their expense receipts" ON storage.objects
  FOR DELETE USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);