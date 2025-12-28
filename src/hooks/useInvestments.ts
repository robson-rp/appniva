import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Investment = Database['public']['Tables']['investments']['Row'];
type InvestmentInsert = Database['public']['Tables']['investments']['Insert'];
type TermDeposit = Database['public']['Tables']['term_deposits']['Row'];
type TermDepositInsert = Database['public']['Tables']['term_deposits']['Insert'];
type BondOTNR = Database['public']['Tables']['bond_otnrs']['Row'];
type BondOTNRInsert = Database['public']['Tables']['bond_otnrs']['Insert'];

export function useInvestments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          term_deposit:term_deposits(*),
          bond_otnr:bond_otnrs(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useInvestmentStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investments', 'stats', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, byType: {} };

      const { data, error } = await supabase
        .from('investments')
        .select('investment_type, principal_amount')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc, inv) => {
          const amount = Number(inv.principal_amount);
          acc.total += amount;
          acc.byType[inv.investment_type] = (acc.byType[inv.investment_type] || 0) + amount;
          return acc;
        },
        { total: 0, byType: {} as Record<string, number> }
      );

      return stats;
    },
    enabled: !!user,
  });
}

export function useCreateInvestment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      investment,
      termDeposit,
      bondOTNR,
      accountId,
    }: {
      investment: Omit<InvestmentInsert, 'user_id'>;
      termDeposit?: Omit<TermDepositInsert, 'investment_id'>;
      bondOTNR?: Omit<BondOTNRInsert, 'investment_id'>;
      accountId?: string;
    }) => {
      if (!user) throw new Error('Não autenticado');

      // Create investment
      const { data: inv, error: invError } = await supabase
        .from('investments')
        .insert({
          ...investment,
          user_id: user.id,
        })
        .select()
        .single();

      if (invError) throw invError;

      // Create specific details if applicable
      if (investment.investment_type === 'term_deposit' && termDeposit) {
        const { error: tdError } = await supabase
          .from('term_deposits')
          .insert({
            ...termDeposit,
            investment_id: inv.id,
          });

        if (tdError) throw tdError;
      }

      if (investment.investment_type === 'bond_otnr' && bondOTNR) {
        const { error: bondError } = await supabase
          .from('bond_otnrs')
          .insert({
            ...bondOTNR,
            investment_id: inv.id,
          });

        if (bondError) throw bondError;
      }

      // Create transaction if account is provided
      if (accountId) {
        const { error: txError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: accountId,
            amount: investment.principal_amount,
            type: 'expense',
            description: `Investimento: ${investment.name}`,
            date: investment.start_date,
            currency: investment.currency || 'AOA',
            source: 'investment',
          });

        if (txError) throw txError;
      }

      return inv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Investimento criado');
    },
    onError: () => {
      toast.error('Erro ao criar investimento');
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast.success('Investimento eliminado');
    },
    onError: () => {
      toast.error('Erro ao eliminar investimento');
    },
  });
}
