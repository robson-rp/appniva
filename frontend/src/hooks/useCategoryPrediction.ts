import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PredictionResult {
  category_id: string | null;
  category_name: string | null;
  confidence: number;
  method: 'keyword' | 'ai' | 'none' | 'error';
  error?: string;
}

interface PredictionLog {
  transaction_id?: string;
  predicted_category_id: string;
  confidence: number;
  description: string;
  accepted?: boolean;
}

export function useCategorizeTransaction() {
  return useMutation({
    mutationFn: async ({ description, type }: { description: string; type: 'expense' | 'income' }): Promise<PredictionResult> => {
      if (!description || description.trim().length < 3) {
        return {
          category_id: null,
          category_name: null,
          confidence: 0,
          method: 'none'
        };
      }

      const { data, error } = await supabase.functions.invoke('categorize-transaction', {
        body: { description: description.trim(), type }
      });

      if (error) {
        console.error('Error calling categorize-transaction:', error);
        throw error;
      }

      return data as PredictionResult;
    }
  });
}

export function useLogPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: PredictionLog) => {
      const { data, error } = await supabase
        .from('category_prediction_logs')
        .insert({
          transaction_id: log.transaction_id || null,
          predicted_category_id: log.predicted_category_id,
          confidence: log.confidence,
          description: log.description,
          accepted: log.accepted
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-logs'] });
    }
  });
}

export function useUpdatePredictionAcceptance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logId, accepted }: { logId: string; accepted: boolean }) => {
      const { data, error } = await supabase
        .from('category_prediction_logs')
        .update({ accepted })
        .eq('id', logId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-logs'] });
    }
  });
}