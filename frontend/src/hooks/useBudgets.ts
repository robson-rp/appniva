import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  category_id: string;
  month: string;
  amount_limit: number;
  spent: number;
  percentage: number;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
}

export type BudgetInsert = Omit<Budget, 'id' | 'spent' | 'percentage' | 'category'>;

export function useBudgets(month?: string) {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['budgets', user?.id, currentMonth],
    queryFn: async () => {
      const response = await api.get(`budgets?month=${currentMonth}`);
      return response.data as Budget[];
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
      // The backend now returns spending data integrated in the index response
      const response = await api.get(`budgets?month=${currentMonth}`);
      return response.data as Budget[];
    },
    enabled: !!user,
  });
}

export function useBudgetsAtRiskCount() {
  const { data: budgets = [] } = useBudgetWithSpending();

  // Count budgets at 80% or more of limit
  const atRiskCount = budgets.filter(b => b.percentage >= 80).length;

  return atRiskCount;
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const response = await api.post('budgets', budget);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento criado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar orçamento');
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...budget }: Partial<Budget> & { id: string }) => {
      const response = await api.put(`budgets/${id}`, budget);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao actualizar orçamento');
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento eliminado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao eliminar orçamento');
    },
  });
}
