import { TransactionForm } from './TransactionForm';
import { useCreateTransaction } from '@/hooks/useTransactions';

interface TransactionFormWrapperProps {
  onSuccess?: () => void;
}

export function TransactionFormWrapper({ onSuccess }: TransactionFormWrapperProps) {
  const createTransaction = useCreateTransaction();

  const handleSubmit = async (data: any) => {
    try {
      await createTransaction.mutateAsync({
        account_id: data.account_id,
        type: data.type,
        amount: data.amount,
        date: data.date,
        category_id: data.category_id || null,
        cost_center_id: data.cost_center_id || null,
        description: data.description || null,
        related_account_id: data.related_account_id || null,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <TransactionForm 
      onSubmit={handleSubmit} 
      isLoading={createTransaction.isPending} 
    />
  );
}