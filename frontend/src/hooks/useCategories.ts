import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export function useCategories(type?: 'expense' | 'income') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categories', user?.id, type],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('is_default', { ascending: false })
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });
}

export function useCreateCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<CategoryInsert, 'user_id'>) => {
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada');
    },
    onError: () => {
      toast.error('Erro ao criar categoria');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria actualizada');
    },
    onError: () => {
      toast.error('Erro ao actualizar categoria');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria eliminada');
    },
    onError: () => {
      toast.error('Erro ao eliminar categoria');
    },
  });
}
