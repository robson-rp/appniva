import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MonthlyMetric {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
  newUsers: number;
}

interface AdminMetrics {
  totalVolume: number;
  totalIncome: number;
  totalExpense: number;
  monthlyTrends: MonthlyMetric[];
  avgTransactionValue: number;
  transactionsByType: { type: string; count: number; volume: number }[];
}

export function useAdminMetrics(months: number = 6) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-metrics', months],
    queryFn: async (): Promise<AdminMetrics> => {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);
      const startDateStr = startDate.toISOString().slice(0, 10);

      // Fetch all transactions for the period
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('type, amount, date, created_at')
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (txError) throw txError;

      // Fetch user registrations for the period
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      if (profilesError) throw profilesError;

      // Calculate monthly trends
      const monthlyData: Record<string, MonthlyMetric> = {};
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Initialize months
      for (let i = 0; i < months; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - months + 1 + i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = {
          month: monthKey,
          monthLabel: monthNames[date.getMonth()],
          income: 0,
          expense: 0,
          balance: 0,
          transactionCount: 0,
          newUsers: 0,
        };
      }

      // Aggregate transaction data
      let totalIncome = 0;
      let totalExpense = 0;
      const typeAggregation: Record<string, { count: number; volume: number }> = {
        income: { count: 0, volume: 0 },
        expense: { count: 0, volume: 0 },
        transfer: { count: 0, volume: 0 },
      };

      (transactions || []).forEach((t) => {
        const monthKey = t.date.slice(0, 7);
        const amount = Number(t.amount);

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].transactionCount++;
          if (t.type === 'income') {
            monthlyData[monthKey].income += amount;
            totalIncome += amount;
          } else if (t.type === 'expense') {
            monthlyData[monthKey].expense += amount;
            totalExpense += amount;
          }
        }

        if (typeAggregation[t.type]) {
          typeAggregation[t.type].count++;
          typeAggregation[t.type].volume += amount;
        }
      });

      // Calculate balances
      Object.values(monthlyData).forEach((m) => {
        m.balance = m.income - m.expense;
      });

      // Aggregate new users per month
      (profiles || []).forEach((p) => {
        if (p.created_at) {
          const monthKey = p.created_at.slice(0, 7);
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].newUsers++;
          }
        }
      });

      const monthlyTrends = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
      const totalTransactions = transactions?.length || 0;

      return {
        totalVolume: totalIncome + totalExpense,
        totalIncome,
        totalExpense,
        avgTransactionValue: totalTransactions > 0 ? (totalIncome + totalExpense) / totalTransactions : 0,
        monthlyTrends,
        transactionsByType: [
          { type: 'Receita', count: typeAggregation.income.count, volume: typeAggregation.income.volume },
          { type: 'Despesa', count: typeAggregation.expense.count, volume: typeAggregation.expense.volume },
          { type: 'Transferência', count: typeAggregation.transfer.count, volume: typeAggregation.transfer.volume },
        ],
      };
    },
    enabled: isAdmin,
  });
}
