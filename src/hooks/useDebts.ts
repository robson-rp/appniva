import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type DebtType = 'personal' | 'mortgage' | 'car' | 'credit_card' | 'student' | 'other';
export type DebtStatus = 'active' | 'closed';
export type InstallmentFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate_annual: number;
  installment_amount: number;
  installment_frequency: InstallmentFrequency;
  next_payment_date: string | null;
  institution: string | null;
  type: DebtType;
  status: DebtStatus;
  currency: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  transaction_id: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface CreateDebtInput {
  name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate_annual: number;
  installment_amount: number;
  installment_frequency: InstallmentFrequency;
  next_payment_date?: string | null;
  institution?: string | null;
  type: DebtType;
  currency?: string;
  notes?: string | null;
}

export interface CreatePaymentInput {
  debt_id: string;
  amount: number;
  payment_date?: string;
  transaction_id?: string | null;
  notes?: string | null;
  account_id?: string | null; // Optional: account to record the expense transaction
}

export function useDebts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('next_payment_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as Debt[];
    },
    enabled: !!user,
  });
}

export function useDebt(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['debts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Debt;
    },
    enabled: !!user && !!id,
  });
}

export function useDebtPayments(debtId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['debt-payments', debtId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('debt_id', debtId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as DebtPayment[];
    },
    enabled: !!user && !!debtId,
  });
}

export function useAllDebtPayments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-debt-payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debt_payments')
        .select('*')
        .order('payment_date', { ascending: true });

      if (error) throw error;
      return data as DebtPayment[];
    },
    enabled: !!user,
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateDebtInput) => {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          ...input,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Dívida criada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar dívida: ' + error.message);
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Debt> & { id: string }) => {
      const { data, error } = await supabase
        .from('debts')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Dívida actualizada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao actualizar dívida: ' + error.message);
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Dívida eliminada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao eliminar dívida: ' + error.message);
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePaymentInput) => {
      // Get debt info for transaction description
      const { data: debt, error: debtError } = await supabase
        .from('debts')
        .select('name, currency')
        .eq('id', input.debt_id)
        .single();
      
      if (debtError) throw debtError;
      
      const { data, error } = await supabase
        .from('debt_payments')
        .insert({
          debt_id: input.debt_id,
          amount: input.amount,
          payment_date: input.payment_date,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create expense transaction if account is provided
      if (input.account_id && user) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: input.account_id,
            type: 'expense',
            amount: input.amount,
            currency: debt.currency,
            date: input.payment_date || new Date().toISOString().split('T')[0],
            description: `Pagamento de dívida: ${debt.name}`,
            source: 'debt_payment',
          });
        
        if (transactionError) {
          console.error('Failed to create transaction:', transactionError);
        }
      }
      
      return data as DebtPayment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt-payments', variables.debt_id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Pagamento registado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao registar pagamento: ' + error.message);
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, debtId }: { id: string; debtId: string }) => {
      const { error } = await supabase
        .from('debt_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return debtId;
    },
    onSuccess: (debtId) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt-payments', debtId] });
      toast.success('Pagamento eliminado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao eliminar pagamento: ' + error.message);
    },
  });
}
