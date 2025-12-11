import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CostCenter {
  id: string;
  user_id: string;
  name: string;
  type: 'income_center' | 'expense_center';
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostCenterWithStats extends CostCenter {
  total_amount: number;
  transaction_count: number;
  budget_percentage?: number;
}

export const useCostCenters = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cost-centers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as CostCenter[];
    },
    enabled: !!user,
  });
};

export const useCostCentersWithStats = (month?: string) => {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['cost-centers-stats', user?.id, currentMonth],
    queryFn: async () => {
      // Get cost centers
      const { data: centers, error: centersError } = await supabase
        .from('cost_centers')
        .select('*')
        .order('name');

      if (centersError) throw centersError;

      // Get transactions for the month
      const startDate = `${currentMonth}-01`;
      const endDate = new Date(
        parseInt(currentMonth.split('-')[0]),
        parseInt(currentMonth.split('-')[1]),
        0
      ).toISOString().split('T')[0];

      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('cost_center_id, amount, type')
        .gte('date', startDate)
        .lte('date', endDate)
        .not('cost_center_id', 'is', null);

      if (transError) throw transError;

      // Get budgets for the month
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('category_id, amount_limit')
        .eq('month', currentMonth);

      if (budgetsError) throw budgetsError;

      const totalBudget = budgets?.reduce((sum, b) => sum + Number(b.amount_limit), 0) || 0;

      // Calculate stats for each center
      const centersWithStats: CostCenterWithStats[] = (centers || []).map((center) => {
        const centerTransactions = transactions?.filter(
          (t) => t.cost_center_id === center.id
        ) || [];

        const total_amount = centerTransactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0
        );

        const budget_percentage = totalBudget > 0 
          ? (total_amount / totalBudget) * 100 
          : 0;

        return {
          ...center,
          total_amount,
          transaction_count: centerTransactions.length,
          budget_percentage,
        } as CostCenterWithStats;
      });

      return centersWithStats;
    },
    enabled: !!user,
  });
};

export const useCreateCostCenter = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<CostCenter, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('cost_centers')
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
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Centro de custo criado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar centro de custo');
    },
  });
};

export const useUpdateCostCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CostCenter> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('cost_centers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Centro de custo atualizado');
    },
    onError: () => {
      toast.error('Erro ao atualizar centro de custo');
    },
  });
};

export const useDeleteCostCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cost_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Centro de custo excluído');
    },
    onError: () => {
      toast.error('Erro ao excluir centro de custo');
    },
  });
};
