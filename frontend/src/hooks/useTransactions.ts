import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  account_id: string;
  category_id?: string;
  related_account_id?: string;
  cost_center_id?: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  account?: { id: string; name: string; currency: string };
  category?: { id: string; name: string; icon: string; color: string; type: string };
  related_account?: { id: string; name: string };
  cost_center?: { id: string; name: string; type: string };
}

export type TransactionInsert = Omit<Transaction, 'id' | 'account' | 'category' | 'related_account' | 'cost_center'>;

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  costCenterId?: string;
  tagId?: string;
}

export function useTransactions(filters?: TransactionFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);
      if (filters?.accountId) params.append('account_id', filters.accountId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.categoryId) params.append('category_id', filters.categoryId);
      if (filters?.costCenterId) params.append('cost_center_id', filters.costCenterId);
      if (filters?.tagId) params.append('tag_id', filters.tagId);

      const response = await api.get(`transactions?${params.toString()}`);
      return response.data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useRecentTransactions(limit: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', 'recent', user?.id, limit],
    queryFn: async () => {
      const response = await api.get(`transactions?limit=${limit}&order_by=date&order_direction=desc`);
      return response.data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useMonthlyStats(month?: string) {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['transactions', 'stats', user?.id, currentMonth],
    queryFn: async () => {
      // The backend should ideally have a stats endpoint, for now we fetch and aggregate if needed, 
      // but a dedicated route is better. Let's assume a stats endpoint for better performance.
      try {
        const response = await api.get(`transactions/stats?month=${currentMonth}`);
        return response.data;
      } catch (e) {
        // Fallback or handle differently if endpoint doesn't exist yet
        const response = await api.get(`transactions?month=${currentMonth}`);
        const data = response.data as Transaction[];
        const stats = data.reduce(
          (acc, t) => {
            if (t.type === 'income') acc.income += Number(t.amount);
            if (t.type === 'expense') acc.expense += Number(t.amount);
            return acc;
          },
          { income: 0, expense: 0, balance: 0 }
        );
        stats.balance = stats.income - stats.expense;
        return stats;
      }
    },
    enabled: !!user,
  });
}

export function useExpensesByCategory(month?: string) {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['transactions', 'expenses-by-category', user?.id, currentMonth],
    queryFn: async () => {
      // Again, a dedicated endpoint is better
      const response = await api.get(`transactions/stats/by-category?month=${currentMonth}&type=expense`);
      return response.data;
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      const response = await api.post('transactions', transaction);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transacção registada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao registar transacção');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transacção eliminada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao eliminar transacção');
    },
  });
}

export function useMonthlyTrends(months: number = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', 'monthly-trends', user?.id, months],
    queryFn: async () => {
      const response = await api.get(`transactions/stats/trends?months=${months}`);
      return response.data;
    },
    enabled: !!user,
  });
}
