import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash';
  current_balance: number;
  initial_balance: number;
  currency: string;
  is_active: boolean;
  color?: string;
}

export type AccountInsert = Omit<Account, 'id' | 'current_balance' | 'is_active'>;
export type AccountUpdate = Partial<AccountInsert>;

export function useAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      const response = await api.get('accounts');
      return response.data as Account[];
    },
    enabled: !!user,
  });
}

export function useActiveAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accounts', 'active', user?.id],
    queryFn: async () => {
      const response = await api.get('accounts?is_active=1');
      return response.data as Account[];
    },
    enabled: !!user,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: AccountInsert) => {
      const response = await api.post('accounts', {
        ...account,
        current_balance: account.initial_balance || 0,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Conta criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar conta');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...account }: AccountUpdate & { id: string }) => {
      const response = await api.put(`accounts/${id}`, account);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Conta actualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao actualizar conta');
    },
  });
}

export function useToggleAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await api.put(`accounts/${id}`, { is_active });
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(is_active ? 'Conta activada' : 'Conta desactivada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao alterar estado da conta');
    },
  });
}
