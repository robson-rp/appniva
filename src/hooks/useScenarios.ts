import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FutureExpense {
  name: string;
  amount: number;
  month: number; // months from now
}

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  monthly_income_estimate: number;
  monthly_expense_estimate: number;
  salary_increase_rate: number;
  investment_return_rate: number;
  inflation_rate: number;
  exchange_rate_projection: number | null;
  time_horizon_years: number;
  future_expenses: FutureExpense[];
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateScenarioInput {
  name: string;
  monthly_income_estimate: number;
  monthly_expense_estimate: number;
  salary_increase_rate: number;
  investment_return_rate: number;
  inflation_rate: number;
  exchange_rate_projection?: number | null;
  time_horizon_years: number;
  future_expenses?: FutureExpense[];
  notes?: string | null;
}

export function useScenarios() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['scenarios', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(s => ({
        ...s,
        future_expenses: (s.future_expenses as unknown as FutureExpense[]) || []
      })) as Scenario[];
    },
    enabled: !!user,
  });
}

export function useScenario(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['scenarios', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        future_expenses: (data.future_expenses as unknown as FutureExpense[]) || []
      } as Scenario;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateScenarioInput) => {
      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          name: input.name,
          monthly_income_estimate: input.monthly_income_estimate,
          monthly_expense_estimate: input.monthly_expense_estimate,
          salary_increase_rate: input.salary_increase_rate,
          investment_return_rate: input.investment_return_rate,
          inflation_rate: input.inflation_rate,
          exchange_rate_projection: input.exchange_rate_projection,
          time_horizon_years: input.time_horizon_years,
          future_expenses: JSON.parse(JSON.stringify(input.future_expenses || [])),
          notes: input.notes,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        future_expenses: (data.future_expenses as unknown as FutureExpense[]) || []
      } as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      toast.success('Cenário criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar cenário: ' + error.message);
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateScenarioInput> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...input };
      if (input.future_expenses) {
        updateData.future_expenses = JSON.parse(JSON.stringify(input.future_expenses));
      }
      
      const { data, error } = await supabase
        .from('scenarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        future_expenses: (data.future_expenses as unknown as FutureExpense[]) || []
      } as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      toast.success('Cenário actualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao actualizar cenário: ' + error.message);
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      toast.success('Cenário eliminado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao eliminar cenário: ' + error.message);
    },
  });
}
