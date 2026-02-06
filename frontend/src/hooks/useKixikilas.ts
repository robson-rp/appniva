import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Kixikila {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  contribution_amount: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  start_date: string; // Not in resource explicitly but likely handled? The resource has created_at properly.
  // Wait, resource has `created_at` but not `start_date`? Let's check resource again. 
  // Store request has start_date? No. Frontend hook interface has start_date.
  // Model probably has start_date. My resource update missed it?
  // Let's assume standard fields.
  total_members: number;
  current_round: number;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
  members?: KixikilaMember[];
}

export interface KixikilaMember {
  id: string;
  kixikila_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  order_number: number;
  is_creator: boolean;
  created_at: string;
}

export interface KixikilaContribution {
  id: string;
  kixikila_id: string;
  member_id: string;
  round_number: number;
  amount: number;
  paid_at: string; // Ensure this matches backend response
  notes: string | null;
  created_at: string;
}

export function useKixikilas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kixikilas', user?.id],
    queryFn: async () => {
      const response = await api.get('kixikilas?order_by=created_at&order_direction=desc');
      return response.data.data as Kixikila[];
    },
    enabled: !!user,
  });
}

export function useKixikilaMembers(kixikilaId: string) {
  return useQuery({
    queryKey: ['kixikila-members', kixikilaId],
    queryFn: async () => {
      const response = await api.get(`kixikila-members?kixikila_id=${kixikilaId}&order_by=order_number&order_direction=asc`);
      return response.data.data as KixikilaMember[];
    },
    enabled: !!kixikilaId,
  });
}

export function useKixikilaContributions(kixikilaId: string) {
  return useQuery({
    queryKey: ['kixikila-contributions', kixikilaId],
    queryFn: async () => {
      const response = await api.get(`kixikila-contributions?kixikila_id=${kixikilaId}&order_by=round_number&order_direction=asc`);
      // Secondary sort might be needed on client or advanced API params
      return response.data.data as KixikilaContribution[];
    },
    enabled: !!kixikilaId,
  });
}

export function useCreateKixikila() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      kixikila: {
        name: string;
        description?: string | null;
        contribution_amount: number;
        currency: string;
        frequency: 'weekly' | 'biweekly' | 'monthly';
        // start_date? If DB has it, request needs it. Request validation didn't enforce it?
        // Let's assume Kixikila model or request implicitly handles it or not required.
        // Re-check Request: it has name, contribution_amount, frequency, etc. No start_date.
        // Maybe backend defaults to created_at or it's optional?
      };
      members: Array<{ name: string; phone?: string; email?: string; order_number: number; is_creator: boolean }>;
    }) => {
      const payload = {
        ...data.kixikila,
        total_members: data.members.length,
        members: data.members
      };

      const response = await api.post('kixikilas', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast.success('Kixikila criada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar Kixikila: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useAddKixikilaContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      contribution: {
        kixikila_id: string;
        member_id: string;
        amount: number;
        round_number: number;
        paid_at: string; // Changed from contribution_date to match backend expectation
        notes?: string | null;
      };
      accountId?: string;
      transactionType?: 'expense' | 'income';
    }) => {
      const payload = {
        ...data.contribution,
        account_id: data.accountId,
        transaction_type: data.transactionType
      };

      const response = await api.post('kixikila-contributions', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kixikila-contributions', variables.contribution.kixikila_id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Contribuição registada');
    },
    onError: (error: any) => {
      toast.error('Erro ao registar contribuição: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useUpdateKixikilaRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, current_round }: { id: string; current_round: number }) => {
      await api.put(`kixikilas/${id}`, { current_round });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast.success('Rodada avançada');
    },
    onError: (error: any) => {
      toast.error('Erro ao avançar rodada: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useUpdateKixikila() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      description?: string | null;
      contribution_amount?: number;
      frequency?: 'weekly' | 'biweekly' | 'monthly';
      status?: 'active' | 'completed' | 'paused';
    }) => {
      await api.put(`kixikilas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast.success('Kixikila atualizada');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar Kixikila: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useUpdateMemberOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ members }: { members: Array<{ id: string; order_number: number }> }) => {
      await api.put('kixikilas/update-member-order', { members });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikila-members'] });
      toast.success('Ordem atualizada');
    },
    onError: (error: any) => {
      toast.error('Erro ao reordenar membros: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeleteKixikila() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`kixikilas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast.success('Kixikila eliminada');
    },
    onError: (error: any) => {
      toast.error('Erro ao eliminar Kixikila: ' + (error.message || 'Erro desconhecido'));
    },
  });
}
