import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Insight = Database['public']['Tables']['insights']['Row'];

export function useInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Insight[];
    },
    enabled: !!user,
  });
}

export function useUnreadInsightsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', 'unread-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useMarkInsightAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insights')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useMarkAllInsightsAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('insights')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Todos os insights marcados como lidos');
    },
  });
}

export function useGenerateInsights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase.functions.invoke('generate-insights');

      if (error) {
        throw new Error(error.message || 'Erro ao gerar insights');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      if (data?.count > 0) {
        toast.success(`${data.count} novo(s) insight(s) gerado(s) com IA`);
      } else {
        toast.info('Nenhum novo insight gerado');
      }
    },
    onError: (error: Error) => {
      if (error.message.includes('429') || error.message.includes('Limite')) {
        toast.error('Limite de pedidos excedido. Tenta mais tarde.');
      } else if (error.message.includes('402') || error.message.includes('Créditos')) {
        toast.error('Créditos de IA esgotados.');
      } else {
        toast.error(error.message || 'Erro ao gerar insights');
      }
    },
  });
}

export function useDeleteInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Insight eliminado');
    },
  });
}
