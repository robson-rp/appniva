import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category?: string;
  icon?: string;
  color?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  percentage: number;
}

export type GoalInsert = Omit<Goal, 'id' | 'percentage' | 'current_amount'>;

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const response = await api.get('goals');
      return response.data as Goal[];
    },
    enabled: !!user,
  });
}

export function useActiveGoals() {
  const { data: goals = [], ...rest } = useGoals();
  const activeGoals = goals.filter(g => g.status === 'in_progress');
  return { goals: activeGoals, ...rest };
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: GoalInsert) => {
      const response = await api.post('goals', {
        ...goal,
        current_amount: 0,
        status: 'in_progress',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Objectivo criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar objectivo');
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...goal }: Partial<Goal> & { id: string }) => {
      const response = await api.put(`goals/${id}`, goal);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Objectivo actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao actualizar objectivo');
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Objectivo eliminado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao eliminar objectivo');
    },
  });
}

export function useAddGoalContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      const response = await api.post(`goals/${goalId}/contributions`, { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Contribuição registada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao registar contribuição');
    },
  });
}
