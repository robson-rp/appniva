import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CriteriaScore {
  name: string;
  score: number;
  weight: number;
  details: string;
}

interface FinancialScore {
  id: string;
  user_id: string;
  score: number;
  criteria_json: {
    criteria: CriteriaScore[];
    generated_at: string;
  };
  generated_at: string;
  created_at: string;
}

export function useLatestFinancialScore() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financial-score', 'latest', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('financial_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      return {
        ...data,
        criteria_json: data.criteria_json as unknown as FinancialScore['criteria_json'],
      } as FinancialScore;
    },
    enabled: !!user?.id,
  });
}

export function useFinancialScoreHistory(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financial-score', 'history', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('financial_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,
        criteria_json: item.criteria_json as unknown as FinancialScore['criteria_json'],
      })) as FinancialScore[];
    },
    enabled: !!user?.id,
  });
}

export function useGenerateFinancialScore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-financial-score');

      if (error) throw error;
      return data as FinancialScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-score'] });
    },
  });
}
