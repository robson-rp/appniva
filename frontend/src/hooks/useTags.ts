import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TagWithCount extends Tag {
  transaction_count: number;
  total_amount: number;
}

export const useTags = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      const response = await api.get('tags');
      return response.data as Tag[];
    },
    enabled: !!user,
  });
};

export const useTagsWithStats = (month?: string) => {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['tags-stats', user?.id, currentMonth],
    queryFn: async () => {
      const response = await api.get(`tags/stats?month=${currentMonth}`);
      return response.data as TagWithCount[];
    },
    enabled: !!user,
  });
};

export const useTransactionTags = (transactionId: string) => {
  return useQuery({
    queryKey: ['transaction-tags', transactionId],
    queryFn: async () => {
      const response = await api.get(`transactions/${transactionId}/tags`);
      return response.data as Tag[];
    },
    enabled: !!transactionId,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const response = await api.post('tags', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar tag');
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; color?: string }) => {
      const response = await api.put(`tags/${data.id}`, { name: data.name, color: data.color });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      toast.success('Tag atualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar tag');
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      toast.success('Tag excluída');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir tag');
    },
  });
};

export const useMergeTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceTagId, targetTagId }: { sourceTagId: string; targetTagId: string }) => {
      await api.post(`tags/${sourceTagId}/merge`, { target_tag_id: targetTagId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-tags'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Tags mescladas com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao mesclar tags');
    },
  });
};

export const useAddTagToTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, tagId }: { transactionId: string; tagId: string }) => {
      const response = await api.post(`transactions/${transactionId}/tags`, { tag_id: tagId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction-tags', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar tag');
    },
  });
};

export const useRemoveTagFromTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, tagId }: { transactionId: string; tagId: string }) => {
      await api.delete(`transactions/${transactionId}/tags/${tagId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction-tags', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover tag');
    },
  });
};
