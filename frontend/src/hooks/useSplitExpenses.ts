import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const SPLIT_EXPENSE_CATEGORIES = [
  'Refeição',
  'Transporte',
  'Alojamento',
  'Supermercado',
  'Entretenimento',
  'Outro'
];

export interface SplitExpense {
  id: string;
  creator_id: string;
  description: string;
  total_amount: number;
  currency: string;
  expense_date: string;
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

export interface SplitExpenseStats {
  totalOwed: number;
  totalSettled: number;
  activeExpenses: number;
  totalExpenses: number;
}

export function useSplitExpenses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['split-expenses', user?.id],
    queryFn: async () => {
      const response = await api.get('split-expenses?order_by=expense_date&order_direction=desc');
      // The API returns paginated data inside 'data' key or just collection?
      // Standard Resource collection returns { data: [...], links: ..., meta: ... }
      // api.get returns axios response. response.data is the body.
      // So response.data.data is the array if passing Resource Collection.
      // Let's assume api.ts interceptor handles unwrapping or we check response structure.
      // The standard Laravel Resource returns wrapped in 'data'.
      // If we look at useAccounts, useTransactions, etc., we usually cast response.data or response.data.data.
      // Let's assume response.data is the full object.
      // If api.ts unwraps, then response is the data.
      // But typically we manually unwrap: returning response.data
      const data = response.data.data || response.data;
      return data as SplitExpenseWithParticipants[];
    },
    enabled: !!user,
  });
}

export function useSplitExpenseStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['split-expenses', 'stats', user?.id],
    queryFn: async () => {
      const response = await api.get('split-expenses/stats');
      return response.data as SplitExpenseStats;
    },
    enabled: !!user,
  });
}

// Calculate balance between people across all expenses
// This logic stays on client for now as it aggregates across loaded expenses
export function useBalanceCalculation() {
  const { data: expenses = [] } = useSplitExpenses();

  // Map: personName -> amount they owe to you (negative means you owe them)
  const balances: Record<string, { name: string; phone?: string; email?: string; balance: number }> = {};

  expenses.filter((e) => !e.is_settled).forEach(expense => {
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

export function useCreateSplitExpense() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      expense: {
        description: string;
        total_amount: number;
        currency: string;
        expense_date: string;
        is_settled?: boolean;
      };
      participants: Array<{ name: string; phone?: string; email?: string; amount_owed: number; is_creator: boolean }>;
      receiptFile?: File;
      accountId?: string;
    }) => {
      // Create expense + participants + transaction in one go
      const payload = {
        ...data.expense,
        participants: data.participants,
        account_id: data.accountId
      };

      const response = await api.post('split-expenses', payload);
      const expense = response.data;

      // Upload receipt if provided
      if (data.receiptFile && expense.id) {
        const formData = new FormData();
        formData.append('file', data.receiptFile);

        await api.post(`split-expenses/${expense.id}/upload-receipt`, formData);
      }

      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Despesa partilhada criada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar despesa: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ participantId, amount }: { participantId: string; amount: number }) => {
      const response = await api.post(`split-expense-participants/${participantId}/payment`, { amount });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      // queryClient.invalidateQueries({ queryKey: ['payment-history'] }); // We don't have a hook for this yet, but if we did
      const amount = data.actualAmount;
      toast.success(`Pagamento de ${amount} registado com sucesso`);
    },
    onError: (error: any) => {
      toast.error('Erro ao registar pagamento: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useSettleSplitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`split-expenses/${id}`, { is_settled: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast.success('Despesa liquidada');
    },
    onError: (error: any) => {
      toast.error('Erro ao liquidar despesa: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeleteSplitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`split-expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast.success('Despesa eliminada');
    },
    onError: (error: any) => {
      toast.error('Erro ao eliminar despesa: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useUploadReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expenseId, file }: { expenseId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`split-expenses/${expenseId}/upload-receipt`, formData);

      return response.data.url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-expenses'] });
      toast.success('Recibo anexado');
    },
    onError: (error: any) => {
      toast.error('Erro ao anexar recibo: ' + (error.message || 'Erro desconhecido'));
    },
  });
}
