import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentHistoryEntry {
  id: string;
  participant_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

export function usePaymentHistory(participantId: string | null) {
  return useQuery({
    queryKey: ['payment-history', participantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('split_expense_payment_history')
        .select('*')
        .eq('participant_id', participantId!)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data as PaymentHistoryEntry[];
    },
    enabled: !!participantId,
  });
}

export function useRecordPaymentWithHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      participantId, 
      amount, 
      notes 
    }: { 
      participantId: string; 
      amount: number; 
      notes?: string;
    }) => {
      // Get current amount paid
      const { data: participant, error: getError } = await supabase
        .from('split_expense_participants')
        .select('amount_paid')
        .eq('id', participantId)
        .single();
      
      if (getError) throw getError;
      
      // Update participant's total amount paid
      const { error: updateError } = await supabase
        .from('split_expense_participants')
        .update({ amount_paid: participant.amount_paid + amount })
        .eq('id', participantId);
      
      if (updateError) throw updateError;
      
      // Record in payment history
      const { error: historyError } = await supabase
        .from('split_expense_payment_history')
        .insert({
          participant_id: participantId,
          amount,
          notes: notes || null,
        });
      
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      toast({ title: 'Pagamento registado', description: 'O pagamento foi registado com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível registar o pagamento.', variant: 'destructive' });
    },
  });
}
