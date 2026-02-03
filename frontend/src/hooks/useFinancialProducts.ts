import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ProductType = 'term_deposit' | 'insurance' | 'microcredit' | 'fund' | 'bond_otnr';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface FinancialProduct {
  id: string;
  name: string;
  product_type: ProductType;
  institution_name: string;
  interest_rate_annual: number | null;
  min_amount: number;
  max_amount: number | null;
  term_min_days: number | null;
  term_max_days: number | null;
  description: string | null;
  features: string[];
  requirements: string[];
  is_active: boolean;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ProductRequest {
  id: string;
  user_id: string;
  product_id: string;
  status: RequestStatus;
  requested_amount: number;
  requested_term_days: number | null;
  notes: string | null;
  response_notes: string | null;
  created_at: string;
  updated_at: string;
  product?: FinancialProduct;
}

export function useFinancialProducts(productType?: ProductType) {
  return useQuery({
    queryKey: ['financial-products', productType],
    queryFn: async () => {
      let query = supabase
        .from('financial_products')
        .select('*')
        .eq('is_active', true)
        .order('interest_rate_annual', { ascending: false, nullsFirst: false });

      if (productType) {
        query = query.eq('product_type', productType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string || '[]'),
        requirements: Array.isArray(p.requirements) ? p.requirements : JSON.parse(p.requirements as string || '[]'),
      })) as FinancialProduct[];
    },
  });
}

export function useProductRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['product-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('product_requests')
        .select(`
          *,
          product:financial_products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(r => ({
        ...r,
        product: r.product ? {
          ...r.product,
          features: Array.isArray(r.product.features) ? r.product.features : JSON.parse(r.product.features as string || '[]'),
          requirements: Array.isArray(r.product.requirements) ? r.product.requirements : JSON.parse(r.product.requirements as string || '[]'),
        } : undefined,
      })) as ProductRequest[];
    },
    enabled: !!user,
  });
}

export function useCreateProductRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product_id: string;
      requested_amount: number;
      requested_term_days?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('product_requests')
        .insert({
          user_id: user.id,
          product_id: data.product_id,
          requested_amount: data.requested_amount,
          requested_term_days: data.requested_term_days,
          notes: data.notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-requests'] });
      toast.success('Solicitação enviada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao enviar solicitação');
    },
  });
}

export function useCancelProductRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('product_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-requests'] });
      toast.success('Solicitação cancelada');
    },
    onError: () => {
      toast.error('Erro ao cancelar solicitação');
    },
  });
}

// Simulation helper
export function simulateReturn(
  principal: number,
  annualRate: number,
  termDays: number
): { grossReturn: number; netReturn: number; totalAmount: number } {
  const dailyRate = annualRate / 100 / 365;
  const grossReturn = principal * dailyRate * termDays;
  const taxRate = 0.10; // 10% IRT
  const netReturn = grossReturn * (1 - taxRate);
  const totalAmount = principal + netReturn;
  
  return { grossReturn, netReturn, totalAmount };
}
