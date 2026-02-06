import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type DebtType = 'personal' | 'mortgage' | 'car' | 'credit_card' | 'student' | 'other';
export type DebtStatus = 'active' | 'closed';
export type InstallmentFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate_annual: number;
  installment_amount: number;
  installment_frequency: InstallmentFrequency;
  next_payment_date: string | null;
  institution: string | null;
  type: DebtType;
  status: DebtStatus;
  currency: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  transaction_id: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface CreateDebtInput {
  name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate_annual: number;
  installment_amount: number;
  installment_frequency: InstallmentFrequency;
  next_payment_date?: string | null;
  institution?: string | null;
  type: DebtType;
  currency?: string;
  notes?: string | null;
}

export interface CreatePaymentInput {
  debt_id: string;
  amount: number;
  payment_date?: string;
  transaction_id?: string | null;
  notes?: string | null;
  account_id?: string | null; // Optional: account to record the expense transaction
}

export function useDebts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const response = await api.get('debts?order_by=next_payment_date&order_direction=asc');
      return response.data as Debt[];
    },
    enabled: !!user,
  });
}

export function useDebt(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['debts', id],
    queryFn: async () => {
      const response = await api.get(`debts/${id}`);
      return response.data as Debt;
    },
    enabled: !!user && !!id,
  });
}

export function useDebtPayments(debtId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['debt-payments', debtId],
    queryFn: async () => {
      const response = await api.get(`debt-payments?debt_id=${debtId}&order_by=payment_date&order_direction=desc`);
      return response.data as DebtPayment[];
    },
    enabled: !!user && !!debtId,
  });
}

export function useAllDebtPayments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-debt-payments', user?.id],
    queryFn: async () => {
      const response = await api.get('debt-payments?order_by=payment_date&order_direction=asc');
      return response.data as DebtPayment[];
    },
    enabled: !!user,
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDebtInput) => {
      const response = await api.post('debts', input);
      return response.data as Debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Dívida criada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar dívida: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Debt> & { id: string }) => {
      const response = await api.put(`debts/${id}`, input);
      return response.data as Debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Dívida actualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao actualizar dívida: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`debts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Dívida eliminada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao eliminar dívida: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePaymentInput) => {
      const response = await api.post('debt-payments', input);
      return response.data as DebtPayment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt-payments', variables.debt_id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Pagamento registado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao registar pagamento: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, debtId }: { id: string; debtId: string }) => {
      await api.delete(`debt-payments/${id}`);
      return debtId;
    },
    onSuccess: (debtId) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt-payments', debtId] });
      toast.success('Pagamento eliminado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao eliminar pagamento: ' + (error.message || 'Erro desconhecido'));
    },
  });
}
