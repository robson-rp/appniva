import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
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
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Tag[];
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
      // Get all tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;

      // Get transaction tags with amounts for the month
      const startDate = `${currentMonth}-01`;
      const endDate = new Date(
        parseInt(currentMonth.split('-')[0]),
        parseInt(currentMonth.split('-')[1]),
        0
      ).toISOString().split('T')[0];

      const { data: transactionTags, error: ttError } = await supabase
        .from('transaction_tags')
        .select(`
          tag_id,
          transaction:transactions(amount, date, type)
        `);

      if (ttError) throw ttError;

      // Filter by month and calculate stats
      const tagsWithStats: TagWithCount[] = (tags || []).map((tag) => {
        const tagTransactions = (transactionTags || [])
          .filter((tt: any) => {
            if (tt.tag_id !== tag.id || !tt.transaction) return false;
            const txDate = tt.transaction.date;
            return txDate >= startDate && txDate <= endDate;
          });

        const total_amount = tagTransactions.reduce(
          (sum: number, tt: any) => sum + Number(tt.transaction?.amount || 0),
          0
        );

        return {
          ...tag,
          transaction_count: tagTransactions.length,
          total_amount,
        };
      });

      return tagsWithStats.sort((a, b) => b.total_amount - a.total_amount);
    },
    enabled: !!user,
  });
};

export const useTransactionTags = (transactionId: string) => {
  return useQuery({
    queryKey: ['transaction-tags', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_tags')
        .select(`
          id,
          tag:tags(id, name, color)
        `)
        .eq('transaction_id', transactionId);

      if (error) throw error;
      return data.map((tt: any) => tt.tag) as Tag[];
    },
    enabled: !!transactionId,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const { data: result, error } = await supabase
        .from('tags')
        .insert({
          ...data,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag criada com sucesso');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Tag com este nome já existe');
      } else {
        toast.error('Erro ao criar tag');
      }
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      toast.success('Tag excluída');
    },
    onError: () => {
      toast.error('Erro ao excluir tag');
    },
  });
};

export const useAddTagToTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, tagId }: { transactionId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('transaction_tags')
        .insert({
          transaction_id: transactionId,
          tag_id: tagId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction-tags', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Tag já associada a esta transação');
      } else {
        toast.error('Erro ao adicionar tag');
      }
    },
  });
};

export const useRemoveTagFromTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, tagId }: { transactionId: string; tagId: string }) => {
      const { error } = await supabase
        .from('transaction_tags')
        .delete()
        .eq('transaction_id', transactionId)
        .eq('tag_id', tagId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction-tags', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['tags-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => {
      toast.error('Erro ao remover tag');
    },
  });
};
