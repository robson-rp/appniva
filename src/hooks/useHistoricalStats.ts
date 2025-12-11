import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface HistoricalStats {
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
  averageInvestmentReturn: number;
  monthsAnalyzed: number;
}

export function useHistoricalStats(months: number = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['historical-stats', user?.id, months],
    queryFn: async (): Promise<HistoricalStats> => {
      if (!user) {
        return {
          averageMonthlyIncome: 0,
          averageMonthlyExpense: 0,
          averageInvestmentReturn: 0,
          monthsAnalyzed: 0,
        };
      }

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - months, 1);
      const startDateStr = startDate.toISOString().slice(0, 10);

      // Fetch transactions for the period
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', user.id)
        .gte('date', startDateStr);

      if (txError) throw txError;

      // Calculate monthly totals
      const monthlyData: Record<string, { income: number; expense: number }> = {};

      (transactions || []).forEach((t) => {
        const monthKey = t.date.slice(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          monthlyData[monthKey].income += Number(t.amount);
        } else if (t.type === 'expense') {
          monthlyData[monthKey].expense += Number(t.amount);
        }
      });

      const monthsWithData = Object.keys(monthlyData).length;
      const totals = Object.values(monthlyData).reduce(
        (acc, m) => ({
          income: acc.income + m.income,
          expense: acc.expense + m.expense,
        }),
        { income: 0, expense: 0 }
      );

      // Fetch investments to estimate return rate
      const { data: investments, error: invError } = await supabase
        .from('investments')
        .select(`
          investment_type,
          principal_amount,
          term_deposits (interest_rate_annual),
          bond_otnrs (coupon_rate_annual)
        `)
        .eq('user_id', user.id);

      if (invError) throw invError;

      // Calculate weighted average return rate
      let totalPrincipal = 0;
      let weightedReturn = 0;

      (investments || []).forEach((inv: any) => {
        const principal = Number(inv.principal_amount);
        totalPrincipal += principal;

        if (inv.investment_type === 'term_deposit' && inv.term_deposits?.length > 0) {
          weightedReturn += principal * Number(inv.term_deposits[0].interest_rate_annual);
        } else if (inv.investment_type === 'bond_otnr' && inv.bond_otnrs?.length > 0) {
          weightedReturn += principal * Number(inv.bond_otnrs[0].coupon_rate_annual);
        }
      });

      const averageInvestmentReturn = totalPrincipal > 0 
        ? weightedReturn / totalPrincipal 
        : 8; // Default 8%

      return {
        averageMonthlyIncome: monthsWithData > 0 ? Math.round(totals.income / monthsWithData) : 0,
        averageMonthlyExpense: monthsWithData > 0 ? Math.round(totals.expense / monthsWithData) : 0,
        averageInvestmentReturn: Math.round(averageInvestmentReturn * 10) / 10,
        monthsAnalyzed: monthsWithData,
      };
    },
    enabled: !!user,
  });
}
