import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductType, FinancialProduct, RequestStatus } from './useFinancialProducts';

// Admin: Fetch ALL products (including inactive)
export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string || '[]'),
        requirements: Array.isArray(p.requirements) ? p.requirements : JSON.parse(p.requirements as string || '[]'),
      })) as FinancialProduct[];
    },
  });
}

// Admin: Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      product_type: ProductType;
      institution_name: string;
      interest_rate_annual?: number;
      min_amount: number;
      max_amount?: number;
      term_min_days?: number;
      term_max_days?: number;
      description?: string;
      features?: string[];
      requirements?: string[];
      currency?: string;
    }) => {
      const { error } = await supabase
        .from('financial_products')
        .insert({
          ...data,
          features: JSON.stringify(data.features || []),
          requirements: JSON.stringify(data.requirements || []),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-products'] });
      toast.success('Produto criado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar produto');
    },
  });
}

// Admin: Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<FinancialProduct> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.features) {
        updateData.features = JSON.stringify(data.features);
      }
      if (data.requirements) {
        updateData.requirements = JSON.stringify(data.requirements);
      }

      const { error } = await supabase
        .from('financial_products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-products'] });
      toast.success('Produto actualizado');
    },
    onError: () => {
      toast.error('Erro ao actualizar produto');
    },
  });
}

// Admin: Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-products'] });
      toast.success('Produto eliminado');
    },
    onError: () => {
      toast.error('Erro ao eliminar produto');
    },
  });
}

// Admin: Fetch ALL product requests
export function useAdminProductRequests() {
  return useQuery({
    queryKey: ['admin-product-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_requests')
        .select(`
          *,
          product:financial_products(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(r => ({
        ...r,
        product: r.product ? {
          ...r.product,
          features: Array.isArray(r.product.features) ? r.product.features : JSON.parse(r.product.features as string || '[]'),
          requirements: Array.isArray(r.product.requirements) ? r.product.requirements : JSON.parse(r.product.requirements as string || '[]'),
        } : undefined,
      }));
    },
  });
}

// Admin: Update request status
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      response_notes,
    }: {
      id: string;
      status: RequestStatus;
      response_notes?: string;
    }) => {
      const { error } = await supabase
        .from('product_requests')
        .update({ status, response_notes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-requests'] });
      queryClient.invalidateQueries({ queryKey: ['product-requests'] });
      toast.success('Estado da solicitação actualizado');
    },
    onError: () => {
      toast.error('Erro ao actualizar solicitação');
    },
  });
}
