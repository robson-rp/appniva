import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Kixikila {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  contribution_amount: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  start_date: string;
  total_members: number;
  current_round: number;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
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
  paid_at: string;
  notes: string | null;
  created_at: string;
}

export function useKixikilas() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['kixikilas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kixikilas')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Kixikila[];
    },
    enabled: !!user,
  });
}

export function useKixikilaMembers(kixikilaId: string) {
  return useQuery({
    queryKey: ['kixikila-members', kixikilaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kixikila_members')
        .select('*')
        .eq('kixikila_id', kixikilaId)
        .order('order_number');
      
      if (error) throw error;
      return data as KixikilaMember[];
    },
    enabled: !!kixikilaId,
  });
}

export function useKixikilaContributions(kixikilaId: string) {
  return useQuery({
    queryKey: ['kixikila-contributions', kixikilaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kixikila_contributions')
        .select('*')
        .eq('kixikila_id', kixikilaId)
        .order('round_number')
        .order('paid_at');
      
      if (error) throw error;
      return data as KixikilaContribution[];
    },
    enabled: !!kixikilaId,
  });
}

export function useCreateKixikila() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { 
      kixikila: Omit<Kixikila, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_round' | 'status'>; 
      members: Array<{ name: string; phone?: string; email?: string; order_number: number; is_creator: boolean }>;
    }) => {
      // Create kixikila
      const { data: kixikila, error: kixikilaError } = await supabase
        .from('kixikilas')
        .insert({ 
          ...data.kixikila, 
          user_id: user!.id,
          total_members: data.members.length 
        })
        .select()
        .single();
      
      if (kixikilaError) throw kixikilaError;
      
      // Create members
      const { error: membersError } = await supabase
        .from('kixikila_members')
        .insert(data.members.map(m => ({ ...m, kixikila_id: kixikila.id })));
      
      if (membersError) throw membersError;
      
      return kixikila;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast({ title: 'Kixikila criada', description: 'A poupança comunitária foi criada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar a kixikila.', variant: 'destructive' });
    },
  });
}

export function useAddKixikilaContribution() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { 
      contribution: Omit<KixikilaContribution, 'id' | 'created_at' | 'paid_at'>;
      accountId?: string;
      transactionType?: 'expense' | 'income';
    }) => {
      // Get kixikila info for transaction description
      const { data: kixikila, error: kixikilaError } = await supabase
        .from('kixikilas')
        .select('name, currency')
        .eq('id', data.contribution.kixikila_id)
        .single();
      
      if (kixikilaError) throw kixikilaError;
      
      const { data: contribution, error } = await supabase
        .from('kixikila_contributions')
        .insert(data.contribution)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create transaction if account is provided
      if (data.accountId && user) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: data.accountId,
            type: data.transactionType || 'expense',
            amount: data.contribution.amount,
            currency: kixikila.currency,
            date: new Date().toISOString().split('T')[0],
            description: `Kixikila: ${kixikila.name} - Rodada ${data.contribution.round_number}`,
            source: 'kixikila',
          });
        
        if (transactionError) {
          console.error('Failed to create transaction:', transactionError);
        }
      }
      
      return contribution;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kixikila-contributions', variables.contribution.kixikila_id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Contribuição registada', description: 'A contribuição foi registada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível registar a contribuição.', variant: 'destructive' });
    },
  });
}

export function useUpdateKixikilaRound() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, current_round }: { id: string; current_round: number }) => {
      const { error } = await supabase
        .from('kixikilas')
        .update({ current_round })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast({ title: 'Rodada avançada', description: 'A kixikila avançou para a próxima rodada.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível avançar a rodada.', variant: 'destructive' });
    },
  });
}

export function useUpdateKixikila() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { 
      id: string; 
      name?: string;
      description?: string | null;
      contribution_amount?: number;
      frequency?: 'weekly' | 'biweekly' | 'monthly';
      status?: 'active' | 'completed' | 'paused';
    }) => {
      const { error } = await supabase
        .from('kixikilas')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast({ title: 'Kixikila atualizada', description: 'As alterações foram guardadas.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a kixikila.', variant: 'destructive' });
    },
  });
}

export function useUpdateMemberOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ members }: { members: Array<{ id: string; order_number: number }> }) => {
      for (const member of members) {
        const { error } = await supabase
          .from('kixikila_members')
          .update({ order_number: member.order_number })
          .eq('id', member.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikila-members'] });
      toast({ title: 'Ordem atualizada', description: 'A ordem dos membros foi alterada.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível reordenar os membros.', variant: 'destructive' });
    },
  });
}

export function useDeleteKixikila() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kixikilas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kixikilas'] });
      toast({ title: 'Kixikila eliminada', description: 'A kixikila foi eliminada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar a kixikila.', variant: 'destructive' });
    },
  });
}
