import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Insight {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  generated_at: string;
  created_at: string;
}

export function useInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.get('insights');
      return response.data as Insight[];
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
      const response = await api.get('insights/unread-count');
      return response.count || 0;
    },
    enabled: !!user,
  });
}

export function useMarkInsightAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`insights/${id}`, { is_read: true });
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
      await api.post('insights/mark-all-read', {});
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
      const response = await api.post('insights/generate', {});
      return response;
    },
    onSuccess: (data: any) => {
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
      await api.delete(`insights/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Insight eliminado');
    },
  });
}
