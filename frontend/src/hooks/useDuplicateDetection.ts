import { useMemo } from 'react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  account_id: string;
  description?: string | null;
  created_at?: string | null;
  account?: {
    id: string;
    name: string;
    currency?: string;
  } | null;
  [key: string]: unknown;
}

interface DuplicateGroup {
  key: string;
  transactions: Transaction[];
  date: string;
  amount: number;
  accountName: string;
}

export function useDuplicateDetection(transactions: Transaction[] | undefined) {
  const duplicateGroups = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Group transactions by date + amount + account_id
    const groups = new Map<string, Transaction[]>();

    transactions.forEach((transaction) => {
      const key = `${transaction.date}-${transaction.amount}-${transaction.account_id}`;
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, transaction]);
    });

    // Filter to only groups with more than 1 transaction (duplicates)
    const duplicates: DuplicateGroup[] = [];
    
    groups.forEach((txs, key) => {
      if (txs.length > 1) {
        duplicates.push({
          key,
          transactions: txs,
          date: txs[0].date,
          amount: txs[0].amount,
          accountName: txs[0].account?.name || 'Conta desconhecida',
        });
      }
    });

    return duplicates;
  }, [transactions]);

  const totalDuplicates = duplicateGroups.reduce(
    (acc, group) => acc + group.transactions.length - 1, 
    0
  );

  return {
    duplicateGroups,
    hasDuplicates: duplicateGroups.length > 0,
    totalDuplicates,
  };
}
