import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, subMonths, format, eachMonthOfInterval } from 'date-fns';

export interface NetWorthDataPoint {
  month: string;
  monthLabel: string;
  assets: number;
  liabilities: number;
  netWorth: number;
  accounts: number;
  investments: number;
  debts: number;
}

export function useNetWorthHistory(months: number = 12) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['net-worth-history', user?.id, months],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subMonths(startOfMonth(endDate), months - 1);
      
      // Get all months in range
      const monthsRange = eachMonthOfInterval({ start: startDate, end: endDate });
      
      // Fetch current accounts
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id, current_balance, initial_balance, created_at')
        .eq('is_active', true);
      
      // Fetch all transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('account_id, amount, type, date')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });
      
      // Fetch investments
      const { data: investments } = await supabase
        .from('investments')
        .select('id, principal_amount, start_date, maturity_date');
      
      // Fetch debts
      const { data: debts } = await supabase
        .from('debts')
        .select('id, current_balance, principal_amount, created_at, status');
      
      // Calculate net worth for each month
      const history: NetWorthDataPoint[] = monthsRange.map(monthDate => {
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const monthKey = format(monthDate, 'yyyy-MM');
        
        // Calculate account balances at this point
        let accountsTotal = 0;
        accounts?.forEach(account => {
          const accountCreatedAt = new Date(account.created_at || '2020-01-01');
          if (accountCreatedAt <= monthEnd) {
            // Start with initial balance
            let balance = account.initial_balance || 0;
            
            // Add transactions up to this month
            transactions?.forEach(tx => {
              if (tx.account_id === account.id && new Date(tx.date) <= monthEnd) {
                if (tx.type === 'income') {
                  balance += tx.amount;
                } else if (tx.type === 'expense') {
                  balance -= tx.amount;
                }
              }
            });
            
            accountsTotal += balance;
          }
        });
        
        // Calculate investments value at this point
        let investmentsTotal = 0;
        investments?.forEach(inv => {
          const startDate = new Date(inv.start_date);
          const maturityDate = inv.maturity_date ? new Date(inv.maturity_date) : null;
          
          // Include if started before or during this month and not matured
          if (startDate <= monthEnd && (!maturityDate || maturityDate >= monthDate)) {
            investmentsTotal += inv.principal_amount;
          }
        });
        
        // Calculate debt balances at this point
        let debtsTotal = 0;
        debts?.forEach(debt => {
          const createdAt = new Date(debt.created_at || '2020-01-01');
          if (createdAt <= monthEnd && debt.status === 'active') {
            // Approximate debt balance (simplified)
            debtsTotal += debt.current_balance;
          }
        });
        
        const assets = accountsTotal + investmentsTotal;
        const liabilities = debtsTotal;
        
        return {
          month: monthKey,
          monthLabel: format(monthDate, 'MMM yyyy'),
          assets,
          liabilities,
          netWorth: assets - liabilities,
          accounts: accountsTotal,
          investments: investmentsTotal,
          debts: debtsTotal,
        };
      });
      
      return history;
    },
    enabled: !!user,
  });
}
