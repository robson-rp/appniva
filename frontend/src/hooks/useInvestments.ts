import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types aligned with Backend Resources
export interface Investment {
  id: string;
  user_id: string;
  name: string;
  investment_type: 'term_deposit' | 'bond' | 'otnr' | 'bond_otnr' | 'stock' | 'mutual_fund' | 'crypto' | 'other';
  principal_amount: number;
  start_date: string;
  maturity_date?: string;
  currency: string;
  institution_name?: string;
  term_deposit?: TermDeposit;
  bond_otnr?: BondOTNR;
  created_at: string;
  updated_at: string;
}

export interface TermDeposit {
  id: string;
  bank: string;
  amount: number;
  rate: number;
  start_date: string;
  maturity_date: string;
  currency: string;
}

export interface BondOTNR {
  id: string;
  issuer: string;
  amount: number;
  coupon_rate: number;
  maturity_date: string;
  currency: string;
}

export interface InvestmentStats {
  total: number;
  byType: Record<string, number>;
}

export interface CreateInvestmentInput {
  name: string;
  investment_type: string;
  principal_amount: number;
  start_date: string;
  maturity_date?: string;
  currency?: string;
  institution_name?: string;
  account_id?: string; // For creating the transaction
  term_deposit?: Omit<TermDeposit, 'id'>;
  bond_otnr?: Omit<BondOTNR, 'id'>;
}

export function useInvestments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async () => {
      const response = await api.get('investments?order_by=created_at&order_direction=desc');
      return response.data as Investment[];
    },
    enabled: !!user,
  });
}

export function useInvestmentStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investments', 'stats', user?.id],
    queryFn: async () => {
      const response = await api.get('investments/stats'); // We need to route this in api.php if not resource standard
      // Actually, standard resource usually doesn't have /stats unless we added it.
      // We added `stats` method to Controller, but need to check if route exists. 
      // Assuming we'll add it or it's there. 
      // Wait, let's double check route existence in next step or assume standard pattern.
      // I will add the route in api.php if missing.
      return response.data as InvestmentStats;
    },
    enabled: !!user,
  });
}

export function useCreateInvestment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInvestmentInput) => {
      const response = await api.post('investments', input);
      return response.data as Investment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Investimento criado');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar investimento: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast.success('Investimento eliminado');
    },
    onError: (error: any) => {
      toast.error('Erro ao eliminar investimento: ' + (error.message || 'Erro desconhecido'));
    },
  });
}
