import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CostCenterBudget {
  id: string;
  user_id: string;
  cost_center_id: string;
  month: string;
  amount_limit: number;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CostCenterBudgetWithSpending extends CostCenterBudget {
  spent: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  cost_center?: {
    id: string;
    name: string;
    type: 'income_center' | 'expense_center';
  };
}

export const useCostCenterBudgets = (month?: string) => {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['cost-center-budgets', user?.id, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_center_budgets')
        .select(`
          *,
          cost_center:cost_centers(id, name, type)
        `)
        .eq('month', currentMonth);

      if (error) throw error;
      return data as (CostCenterBudget & { cost_center: { id: string; name: string; type: 'income_center' | 'expense_center' } })[];
    },
    enabled: !!user,
  });
};

export const useCostCenterBudgetsWithSpending = (month?: string) => {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['cost-center-budgets-spending', user?.id, currentMonth],
    queryFn: async () => {
      // Get budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('cost_center_budgets')
        .select(`
          *,
          cost_center:cost_centers(id, name, type)
        `)
        .eq('month', currentMonth);

      if (budgetsError) throw budgetsError;

      // Get transactions for the month
      const startDate = `${currentMonth}-01`;
      const endDate = new Date(
        parseInt(currentMonth.split('-')[0]),
        parseInt(currentMonth.split('-')[1]),
        0
      ).toISOString().split('T')[0];

      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('cost_center_id, amount')
        .gte('date', startDate)
        .lte('date', endDate)
        .not('cost_center_id', 'is', null);

      if (transError) throw transError;

      // Calculate spending for each budget
      const budgetsWithSpending: CostCenterBudgetWithSpending[] = (budgets || []).map((budget) => {
        const spent = (transactions || [])
          .filter((t) => t.cost_center_id === budget.cost_center_id)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const percentage = budget.amount_limit > 0 
          ? (spent / budget.amount_limit) * 100 
          : 0;

        return {
          ...budget,
          spent,
          percentage,
          isOverBudget: percentage >= 100,
          isNearLimit: percentage >= budget.alert_threshold && percentage < 100,
        };
      });

      return budgetsWithSpending;
    },
    enabled: !!user,
  });
};

export const useCreateCostCenterBudget = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      cost_center_id: string;
      month: string;
      amount_limit: number;
      alert_threshold?: number;
    }) => {
      const { data: result, error } = await supabase
        .from('cost_center_budgets')
        .insert({
          ...data,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-center-budgets-spending'] });
      toast.success('Orçamento criado com sucesso');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Já existe um orçamento para este centro neste mês');
      } else {
        toast.error('Erro ao criar orçamento');
      }
    },
  });
};

export const useUpdateCostCenterBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CostCenterBudget> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('cost_center_budgets')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-center-budgets-spending'] });
      toast.success('Orçamento atualizado');
    },
    onError: () => {
      toast.error('Erro ao atualizar orçamento');
    },
  });
};

export const useDeleteCostCenterBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cost_center_budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-center-budgets-spending'] });
      toast.success('Orçamento excluído');
    },
    onError: () => {
      toast.error('Erro ao excluir orçamento');
    },
  });
};
