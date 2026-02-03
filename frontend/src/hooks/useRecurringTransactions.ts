import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  cost_center_id: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  next_execution_date: string;
  end_date: string | null;
  is_active: boolean;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  account?: { name: string; currency: string };
  category?: { name: string; color: string };
  cost_center?: { name: string };
}

export interface RecurringTransactionInput {
  account_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id?: string | null;
  cost_center_id?: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  next_execution_date: string;
  end_date?: string | null;
  is_active?: boolean;
}

export function useRecurringTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recurring-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select(`
          *,
          account:accounts(name, currency),
          category:categories(name, color),
          cost_center:cost_centers(name)
        `)
        .eq('user_id', user!.id)
        .order('next_execution_date', { ascending: true });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user,
  });
}

export function useCreateRecurringTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecurringTransactionInput) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          ...input,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast.success('Transação recorrente criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating recurring transaction:', error);
      toast.error('Erro ao criar transação recorrente');
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<RecurringTransactionInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast.success('Transação recorrente actualizada');
    },
    onError: (error) => {
      console.error('Error updating recurring transaction:', error);
      toast.error('Erro ao actualizar transação recorrente');
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast.success('Transação recorrente eliminada');
    },
    onError: (error) => {
      console.error('Error deleting recurring transaction:', error);
      toast.error('Erro ao eliminar transação recorrente');
    },
  });
}

export function useToggleRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast.success(data.is_active ? 'Transação reactivada' : 'Transação pausada');
    },
    onError: (error) => {
      console.error('Error toggling recurring transaction:', error);
      toast.error('Erro ao alterar estado da transação');
    },
  });
}
