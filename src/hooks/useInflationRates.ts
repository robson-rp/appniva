import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTransactions } from './useTransactions';
import { useMemo } from 'react';

export interface InflationRate {
  id: string;
  country: string;
  month: string;
  annual_rate: number;
  monthly_rate: number | null;
  source: string;
  created_at: string;
}

export function useInflationRates() {
  return useQuery({
    queryKey: ['inflation-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inflation_rates')
        .select('*')
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as InflationRate[];
    },
  });
}

export function useInflationAdjustedExpenses() {
  const { data: transactions = [] } = useTransactions();
  const { data: inflationRates = [] } = useInflationRates();
  
  return useMemo(() => {
    // Get only expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group expenses by month
    const monthlyExpenses = expenses.reduce((acc, t) => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { nominal: 0, count: 0 };
      }
      acc[month].nominal += t.amount;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { nominal: number; count: number }>);
    
    // Calculate inflation-adjusted values (base = current month)
    const months = Object.keys(monthlyExpenses).sort().reverse();
    const currentMonth = months[0];
    
    // Build cumulative inflation factors
    const inflationFactors: Record<string, number> = {};
    let cumulativeFactor = 1;
    
    months.forEach((month, index) => {
      if (index === 0) {
        inflationFactors[month] = 1;
        return;
      }
      
      const rate = inflationRates.find(r => r.month === month);
      const monthlyRate = rate?.monthly_rate ?? (rate?.annual_rate ? rate.annual_rate / 12 : 0);
      cumulativeFactor *= (1 + monthlyRate / 100);
      inflationFactors[month] = cumulativeFactor;
    });
    
    // Calculate real (inflation-adjusted) expenses
    const result = months.map((month, idx) => {
      const data = monthlyExpenses[month];
      const factor = inflationFactors[month] || 1;
      return {
        month,
        nominal: data.nominal,
        real: data.nominal * factor,
        inflationFactor: factor,
        transactionCount: data.count,
        percentageChange: idx > 0 
          ? ((data.nominal - (monthlyExpenses[months[0]]?.nominal || 0)) / (monthlyExpenses[months[0]]?.nominal || 1)) * 100
          : 0,
      };
    });
    
    // Compare current vs previous month (real values)
    const comparison = result.length >= 2 ? {
      currentMonth: result[0],
      previousMonth: result[1],
      realChange: result[0].real - result[1].real,
      realChangePercent: ((result[0].real - result[1].real) / result[1].real) * 100,
      nominalChange: result[0].nominal - result[1].nominal,
      nominalChangePercent: ((result[0].nominal - result[1].nominal) / result[1].nominal) * 100,
    } : null;
    
    return {
      monthlyData: result,
      comparison,
      hasInflationData: inflationRates.length > 0,
    };
  }, [transactions, inflationRates]);
}
