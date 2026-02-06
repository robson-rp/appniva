import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
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
  account: { name: string; currency: string };
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
      const response = await api.get('recurring-transactions?order_by=next_execution_date&order_direction=asc');
      // Assuming resource collection unwrapping handled by api or needing manual unwrapping
      // Usually api.get returns axios response. data property has the JSON body.
      // Laravel resource collection: { data: [...] }
      const data = response.data.data || response.data;
      return data as RecurringTransaction[];
    },
    enabled: !!user,
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecurringTransactionInput) => {
      const response = await api.post('recurring-transactions', input);
      return response.data; // Returns wrapped resource? or unwrapped? 
      // Laravel Resource: data key. But api.ts might not auto-unwrap fully.
      // Usually { data: { ... } }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast.success('Transação recorrente criada com sucesso');
    },
    onError: (error: any) => {
      console.error('Error creating recurring transaction:', error);
      toast.error('Erro ao criar transação recorrente: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<RecurringTransactionInput> & { id: string }) => {
      const response = await api.put(`recurring-transactions/${id}`, input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast.success('Transação recorrente actualizada');
    },
    onError: (error: any) => {
      console.error('Error updating recurring transaction:', error);
      toast.error('Erro ao actualizar transação recorrente: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`recurring-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast.success('Transação recorrente eliminada');
    },
    onError: (error: any) => {
      console.error('Error deleting recurring transaction:', error);
      toast.error('Erro ao eliminar transação recorrente: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useToggleRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const response = await api.put(`recurring-transactions/${id}`, { is_active });
      return response.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      // data.data.is_active if wrapped
      const isActive = data.data?.is_active ?? data.is_active;
      toast.success(isActive ? 'Transação reactivada' : 'Transação pausada');
    },
    onError: (error: any) => {
      console.error('Error toggling recurring transaction:', error);
      toast.error('Erro ao alterar estado da transação: ' + (error.message || 'Erro desconhecido'));
    },
  });
}
