import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Account = Database['public']['Tables']['accounts']['Row'];
type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

export function useAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user,
  });
}

export function useActiveAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accounts', 'active', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user,
  });
}

export function useCreateAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Omit<AccountInsert, 'user_id'>) => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...account,
          user_id: user.id,
          current_balance: account.initial_balance || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Conta criada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar conta');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...account }: AccountUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(account)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Conta actualizada');
    },
    onError: () => {
      toast.error('Erro ao actualizar conta');
    },
  });
}

export function useToggleAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('accounts')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(is_active ? 'Conta activada' : 'Conta desactivada');
    },
    onError: () => {
      toast.error('Erro ao alterar estado da conta');
    },
  });
}
