import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
}

export function useTransactions(filters?: TransactionFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('transactions')
        .select(`
          *,
          account:accounts!transactions_account_id_fkey(id, name, currency),
          category:categories(id, name, icon, color, type),
          related_account:accounts!transactions_related_account_id_fkey(id, name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRecentTransactions(limit: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', 'recent', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          account:accounts!transactions_account_id_fkey(id, name, currency),
          category:categories(id, name, icon, color, type)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
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
      if (!user) return { income: 0, expense: 0, balance: 0 };

      const startDate = `${currentMonth}-01`;
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${currentMonth}-${lastDay}`;

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc, t) => {
          if (t.type === 'income') acc.income += Number(t.amount);
          if (t.type === 'expense') acc.expense += Number(t.amount);
          return acc;
        },
        { income: 0, expense: 0, balance: 0 }
      );

      stats.balance = stats.income - stats.expense;
      return stats;
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
      if (!user) return [];

      const startDate = `${currentMonth}-01`;
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${currentMonth}-${lastDay}`;

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          category:categories(id, name, color)
        `)
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const byCategory = (data || []).reduce((acc, t) => {
        const categoryName = t.category?.name || 'Sem categoria';
        const color = t.category?.color || '#6b7280';
        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0, color };
        }
        acc[categoryName].value += Number(t.amount);
        return acc;
      }, {} as Record<string, { name: string; value: number; color: string }>);

      return Object.values(byCategory).sort((a, b) => b.value - a.value);
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<TransactionInsert, 'user_id'>) => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transacção registada');
    },
    onError: () => {
      toast.error('Erro ao registar transacção');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transacção eliminada');
    },
    onError: () => {
      toast.error('Erro ao eliminar transacção');
    },
  });
}

export function useMonthlyTrends(months: number = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', 'monthly-trends', user?.id, months],
    queryFn: async () => {
      if (!user) return [];

      const trends: { month: string; monthLabel: string; income: number; expense: number; balance: number }[] = [];
      const today = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;
        
        const startDate = `${monthKey}-01`;
        const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
        const endDate = `${monthKey}-${lastDay}`;

        const { data, error } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;

        const stats = (data || []).reduce(
          (acc, t) => {
            if (t.type === 'income') acc.income += Number(t.amount);
            if (t.type === 'expense') acc.expense += Number(t.amount);
            return acc;
          },
          { income: 0, expense: 0 }
        );

        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        trends.push({
          month: monthKey,
          monthLabel: monthNames[date.getMonth()],
          income: stats.income,
          expense: stats.expense,
          balance: stats.income - stats.expense,
        });
      }

      return trends;
    },
    enabled: !!user,
  });
}
