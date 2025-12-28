import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SplitExpense {
  id: string;
  creator_id: string;
  description: string;
  total_amount: number;
  currency: string;
  expense_date: string;
  category: string | null;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SplitExpenseParticipant {
  id: string;
  expense_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  amount_owed: number;
  amount_paid: number;
  is_creator: boolean;
  created_at: string;
  updated_at: string;
}

export interface SplitExpenseWithParticipants extends SplitExpense {
  participants: SplitExpenseParticipant[];
}

export function useSplitExpenses() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['split-expenses', user?.id],
    queryFn: async () => {
      const { data: expenses, error: expensesError } = await supabase
        .from('split_expenses')
        .select('*')
        .eq('creator_id', user!.id)
        .order('expense_date', { ascending: false });
      
      if (expensesError) throw expensesError;
      
      // Get all participants for these expenses
      const expenseIds = expenses.map(e => e.id);
      const { data: participants, error: participantsError } = await supabase
        .from('split_expense_participants')
        .select('*')
        .in('expense_id', expenseIds);
      
      if (participantsError) throw participantsError;
      
      // Combine expenses with their participants
      return expenses.map(expense => ({
        ...expense,
        participants: participants.filter(p => p.expense_id === expense.id),
      })) as SplitExpenseWithParticipants[];
    },
    enabled: !!user,
  });
}

export function useSplitExpenseStats() {
  const { data: expenses = [] } = useSplitExpenses();
  
  const totalOwed = expenses
    .filter(e => !e.is_settled)
    .reduce((sum, e) => {
      return sum + e.participants
        .filter(p => !p.is_creator)
        .reduce((pSum, p) => pSum + (p.amount_owed - p.amount_paid), 0);
    }, 0);
  
  const totalSettled = expenses
    .filter(e => e.is_settled)
    .reduce((sum, e) => sum + e.total_amount, 0);
  
  const activeExpenses = expenses.filter(e => !e.is_settled).length;
  
  return {
    totalOwed,
    totalSettled,
    activeExpenses,
    totalExpenses: expenses.length,
  };
}

export function useCreateSplitExpense() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      expense: Omit<SplitExpense, 'id' | 'creator_id' | 'created_at' | 'updated_at'>;
      participants: Array<{ name: string; phone?: string; email?: string; amount_owed: number; is_creator: boolean }>;
    }) => {
      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from('split_expenses')
        .insert({ ...data.expense, creator_id: user!.id })
        .select()
        .single();
      
      if (expenseError) throw expenseError;
      
      // Create participants
      const { error: participantsError } = await supabase
        .from('split_expense_participants')
        .insert(data.participants.map(p => ({
          ...p,
          expense_id: expense.id,
          amount_paid: p.is_creator ? p.amount_owed : 0,
        })));
      
      if (participantsError) throw participantsError;
      
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast({ title: 'Despesa criada', description: 'A despesa partilhada foi criada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar a despesa.', variant: 'destructive' });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ participantId, amount }: { participantId: string; amount: number }) => {
      // Get current amount paid
      const { data: participant, error: getError } = await supabase
        .from('split_expense_participants')
        .select('amount_paid')
        .eq('id', participantId)
        .single();
      
      if (getError) throw getError;
      
      const { error } = await supabase
        .from('split_expense_participants')
        .update({ amount_paid: participant.amount_paid + amount })
        .eq('id', participantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast({ title: 'Pagamento registado', description: 'O pagamento foi registado com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível registar o pagamento.', variant: 'destructive' });
    },
  });
}

export function useSettleSplitExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('split_expenses')
        .update({ is_settled: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast({ title: 'Despesa liquidada', description: 'A despesa foi marcada como liquidada.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível liquidar a despesa.', variant: 'destructive' });
    },
  });
}

export function useDeleteSplitExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('split_expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast({ title: 'Despesa eliminada', description: 'A despesa foi eliminada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar a despesa.', variant: 'destructive' });
    },
  });
}
