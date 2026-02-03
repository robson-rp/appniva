import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });
}

export function useActiveGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', 'active', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('target_date', { ascending: true });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Omit<GoalInsert, 'user_id'>) => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta criada');
    },
    onError: () => {
      toast.error('Erro ao criar meta');
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...goal }: GoalUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(goal)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta actualizada');
    },
    onError: () => {
      toast.error('Erro ao actualizar meta');
    },
  });
}

export function useAddContribution() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, amount, accountId }: { goalId: string; amount: number; accountId?: string }) => {
      if (!user) throw new Error('Não autenticado');

      // Get goal details for the description
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('name, currency')
        .eq('id', goalId)
        .single();

      if (goalError) throw goalError;

      const { data, error } = await supabase
        .from('goal_contributions')
        .insert({
          goal_id: goalId,
          amount,
        })
        .select()
        .single();

      if (error) throw error;

      // Create transaction if account is provided
      if (accountId) {
        const { error: txError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: accountId,
            amount,
            type: 'expense',
            description: `Contribuição para meta: ${goal.name}`,
            date: new Date().toISOString().split('T')[0],
            currency: goal.currency,
            source: 'goal_contribution',
          });

        if (txError) throw txError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Contribuição adicionada');
    },
    onError: () => {
      toast.error('Erro ao adicionar contribuição');
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta eliminada');
    },
    onError: () => {
      toast.error('Erro ao eliminar meta');
    },
  });
}
