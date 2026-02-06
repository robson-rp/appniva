import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
  is_default: boolean;
  parent_id?: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'is_default'>;

export function useCategories(type?: 'expense' | 'income') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categories', user?.id, type],
    queryFn: async () => {
      const url = type ? `categories?type=${type}` : 'categories';
      const response = await api.get(url);
      return response.data as Category[];
    },
    enabled: !!user,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const response = await api.post('categories', {
        ...category,
        is_default: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar categoria');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      const response = await api.put(`categories/${id}`, category);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria actualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao actualizar categoria');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria eliminada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao eliminar categoria');
    },
  });
}
