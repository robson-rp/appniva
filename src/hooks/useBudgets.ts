import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Budget = Database['public']['Tables']['budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];

export function useBudgets(month?: string) {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['budgets', user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .eq('month', currentMonth);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useBudgetWithSpending(month?: string) {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['budgets', 'with-spending', user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return [];

      // Get budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .eq('month', currentMonth);

      if (budgetsError) throw budgetsError;

      // Get expenses for the month
      const startDate = `${currentMonth}-01`;
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${currentMonth}-${lastDay}`;

      const { data: expenses, error: expensesError } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (expensesError) throw expensesError;

      // Sum expenses by category
      const expensesByCategory = (expenses || []).reduce((acc, t) => {
        if (t.category_id) {
          acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
        }
        return acc;
      }, {} as Record<string, number>);

      // Combine budgets with spending
      return (budgets || []).map((budget) => ({
        ...budget,
        spent: expensesByCategory[budget.category_id] || 0,
        percentage: budget.amount_limit > 0
          ? Math.round((expensesByCategory[budget.category_id] || 0) / Number(budget.amount_limit) * 100)
          : 0,
      }));
    },
    enabled: !!user,
  });
}

export function useCreateBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: Omit<BudgetInsert, 'user_id'>) => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budget,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um orçamento para esta categoria neste mês');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento criado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar orçamento');
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...budget }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(budget)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento actualizado');
    },
    onError: () => {
      toast.error('Erro ao actualizar orçamento');
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento eliminado');
    },
    onError: () => {
      toast.error('Erro ao eliminar orçamento');
    },
  });
}
