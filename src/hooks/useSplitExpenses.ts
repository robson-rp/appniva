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
  receipt_url: string | null;
  share_token: string | null;
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

// Predefined categories for split expenses
export const SPLIT_EXPENSE_CATEGORIES = [
  { value: 'dinner', label: 'Jantar', icon: '🍽️' },
  { value: 'lunch', label: 'Almoço', icon: '🥗' },
  { value: 'travel', label: 'Viagem', icon: '✈️' },
  { value: 'shopping', label: 'Compras', icon: '🛍️' },
  { value: 'event', label: 'Evento', icon: '🎉' },
  { value: 'gift', label: 'Presente', icon: '🎁' },
  { value: 'utilities', label: 'Contas', icon: '💡' },
  { value: 'entertainment', label: 'Entretenimento', icon: '🎬' },
  { value: 'transport', label: 'Transporte', icon: '🚗' },
  { value: 'other', label: 'Outros', icon: '📦' },
];

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
      if (expenseIds.length === 0) return [];
      
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

// Calculate balance between people across all expenses
export function useBalanceCalculation() {
  const { data: expenses = [] } = useSplitExpenses();
  
  // Map: personName -> amount they owe to you (negative means you owe them)
  const balances: Record<string, { name: string; phone?: string; email?: string; balance: number }> = {};
  
  expenses.filter(e => !e.is_settled).forEach(expense => {
    expense.participants.forEach(p => {
      if (p.is_creator) return;
      
      const key = p.name.toLowerCase().trim();
      const owes = p.amount_owed - p.amount_paid;
      
      if (!balances[key]) {
        balances[key] = { name: p.name, phone: p.phone || undefined, email: p.email || undefined, balance: 0 };
      }
      balances[key].balance += owes;
      if (p.phone) balances[key].phone = p.phone;
      if (p.email) balances[key].email = p.email;
    });
  });
  
  return Object.values(balances).filter(b => b.balance !== 0).sort((a, b) => b.balance - a.balance);
}

function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useCreateSplitExpense() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      expense: Omit<SplitExpense, 'id' | 'creator_id' | 'created_at' | 'updated_at' | 'share_token'>;
      participants: Array<{ name: string; phone?: string; email?: string; amount_owed: number; is_creator: boolean }>;
      receiptFile?: File;
    }) => {
      // Generate share token
      const shareToken = generateShareToken();
      
      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from('split_expenses')
        .insert({ 
          ...data.expense, 
          creator_id: user!.id,
          share_token: shareToken,
        })
        .select()
        .single();
      
      if (expenseError) throw expenseError;
      
      // Upload receipt if provided
      if (data.receiptFile) {
        const fileExt = data.receiptFile.name.split('.').pop();
        const filePath = `${user!.id}/${expense.id}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(filePath, data.receiptFile);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('expense-receipts')
            .getPublicUrl(filePath);
          
          await supabase
            .from('split_expenses')
            .update({ receipt_url: urlData.publicUrl })
            .eq('id', expense.id);
        }
      }
      
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
      // Get current participant data
      const { data: participant, error: getError } = await supabase
        .from('split_expense_participants')
        .select('amount_paid, amount_owed, is_creator')
        .eq('id', participantId)
        .single();
      
      if (getError) throw getError;
      
      // Don't allow payment for creators (they paid the bill)
      if (participant.is_creator) {
        throw new Error('O criador já pagou a conta.');
      }
      
      // Calculate remaining amount
      const remaining = participant.amount_owed - participant.amount_paid;
      
      // Don't allow if already fully paid
      if (remaining <= 0) {
        throw new Error('Este participante já pagou o valor total.');
      }
      
      // Limit payment to remaining amount
      const actualAmount = Math.min(amount, remaining);
      
      const { error } = await supabase
        .from('split_expense_participants')
        .update({ amount_paid: participant.amount_paid + actualAmount })
        .eq('id', participantId);
      
      if (error) throw error;
      
      // Record in payment history
      await supabase
        .from('split_expense_payment_history')
        .insert({
          participant_id: participantId,
          amount: actualAmount,
        });
      
      return { actualAmount, remaining };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      toast({ title: 'Pagamento registado', description: `Foi registado ${data?.actualAmount ? `o valor de ${data.actualAmount}` : 'o pagamento'} com sucesso.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message || 'Não foi possível registar o pagamento.', variant: 'destructive' });
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

export function useUploadReceipt() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ expenseId, file }: { expenseId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/${expenseId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('split_expenses')
        .update({ receipt_url: urlData.publicUrl })
        .eq('id', expenseId);
      
      if (updateError) throw updateError;
      
      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast({ title: 'Recibo anexado', description: 'O recibo foi anexado à despesa.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível anexar o recibo.', variant: 'destructive' });
    },
  });
}
