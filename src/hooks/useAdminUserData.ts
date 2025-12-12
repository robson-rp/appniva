import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminUserData(userId: string | null) {
  const accounts = useQuery({
    queryKey: ['admin-user-accounts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const transactions = useQuery({
    queryKey: ['admin-user-transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          account:accounts(name),
          category:categories(name, color)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const debts = useQuery({
    queryKey: ['admin-user-debts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const investments = useQuery({
    queryKey: ['admin-user-investments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const goals = useQuery({
    queryKey: ['admin-user-goals', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const financialScore = useQuery({
    queryKey: ['admin-user-score', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('financial_scores')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const isLoading = accounts.isLoading || transactions.isLoading || debts.isLoading || 
                    investments.isLoading || goals.isLoading || financialScore.isLoading;

  return {
    accounts: accounts.data || [],
    transactions: transactions.data || [],
    debts: debts.data || [],
    investments: investments.data || [],
    goals: goals.data || [],
    financialScore: financialScore.data,
    isLoading,
  };
}
