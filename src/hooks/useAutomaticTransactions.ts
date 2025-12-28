import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TransactionSource = 
  | 'debt_payment' 
  | 'school_fee' 
  | 'remittance' 
  | 'kixikila' 
  | 'goal_contribution' 
  | 'investment' 
  | 'subscription';

export interface AutomaticTransaction {
  id: string;
  description: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  currency: string;
  source: TransactionSource | null;
  created_at: string | null;
  account?: {
    name: string;
  } | null;
  category?: {
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export const SOURCE_LABELS: Record<TransactionSource, string> = {
  debt_payment: 'Pagamento de Dívida',
  school_fee: 'Propina Escolar',
  remittance: 'Remessa',
  kixikila: 'Kixikila',
  goal_contribution: 'Contribuição para Meta',
  investment: 'Investimento',
  subscription: 'Subscrição',
};

export const SOURCE_COLORS: Record<TransactionSource, string> = {
  debt_payment: '#ef4444',
  school_fee: '#f59e0b',
  remittance: '#10b981',
  kixikila: '#8b5cf6',
  goal_contribution: '#3b82f6',
  investment: '#06b6d4',
  subscription: '#ec4899',
};

export function useAutomaticTransactions(filters?: {
  source?: TransactionSource;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['automatic-transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          id,
          description,
          amount,
          type,
          date,
          currency,
          source,
          created_at,
          account:accounts!transactions_account_id_fkey(name),
          category:categories(name, color, icon)
        `)
        .not('source', 'is', null)
        .order('date', { ascending: false });

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as AutomaticTransaction[];
    },
  });
}

export function useAutomaticTransactionStats() {
  return useQuery({
    queryKey: ['automatic-transaction-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('source, amount, type')
        .not('source', 'is', null);

      if (error) throw error;

      const stats: Record<TransactionSource, { count: number; total: number }> = {
        debt_payment: { count: 0, total: 0 },
        school_fee: { count: 0, total: 0 },
        remittance: { count: 0, total: 0 },
        kixikila: { count: 0, total: 0 },
        goal_contribution: { count: 0, total: 0 },
        investment: { count: 0, total: 0 },
        subscription: { count: 0, total: 0 },
      };

      data?.forEach((tx) => {
        const source = tx.source as TransactionSource;
        if (source && stats[source]) {
          stats[source].count += 1;
          stats[source].total += Number(tx.amount);
        }
      });

      return stats;
    },
  });
}
