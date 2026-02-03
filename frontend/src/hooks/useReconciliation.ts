import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ReconciliationStatus = Database['public']['Enums']['reconciliation_status'];

export interface BankReconciliation {
  id: string;
  user_id: string;
  account_id: string;
  transaction_id: string | null;
  external_amount: number;
  external_description: string | null;
  external_date: string | null;
  status: ReconciliationStatus;
  created_at: string;
  updated_at: string;
  transaction?: {
    id: string;
    amount: number;
    description: string | null;
    date: string;
    type: string;
  } | null;
}

export interface ImportedTransaction {
  external_amount: number;
  external_description: string;
  external_date: string;
}

export function useReconciliations(accountId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reconciliations', accountId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_reconciliations')
        .select(`
          *,
          transaction:transactions(id, amount, description, date, type)
        `)
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BankReconciliation[];
    },
    enabled: !!user?.id && !!accountId,
  });
}

export function useAccountTransactions(accountId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['account-transactions', accountId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, description, date, type, category_id')
        .eq('account_id', accountId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!accountId,
  });
}

export function useImportReconciliationData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      transactions,
    }: {
      accountId: string;
      transactions: ImportedTransaction[];
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const records = transactions.map((t) => ({
        user_id: user.id,
        account_id: accountId,
        external_amount: t.external_amount,
        external_description: t.external_description,
        external_date: t.external_date,
        status: 'pending' as ReconciliationStatus,
      }));

      const { data, error } = await supabase
        .from('bank_reconciliations')
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations', variables.accountId] });
      toast.success('Dados importados com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao importar dados: ' + error.message);
    },
  });
}

export function useReconcileTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reconciliationId,
      transactionId,
      status,
    }: {
      reconciliationId: string;
      transactionId: string | null;
      status: ReconciliationStatus;
    }) => {
      const { data, error } = await supabase
        .from('bank_reconciliations')
        .update({
          transaction_id: transactionId,
          status,
        })
        .eq('id', reconciliationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations', data.account_id] });
      toast.success('Reconciliação atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao reconciliar: ' + error.message);
    },
  });
}

export function useAutoReconcile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Fetch pending reconciliations
      const { data: pending, error: pendingError } = await supabase
        .from('bank_reconciliations')
        .select('*')
        .eq('account_id', accountId)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch unreconciled transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('id, amount, description, date')
        .eq('account_id', accountId);

      if (txError) throw txError;

      // Get already matched transaction IDs
      const { data: matched, error: matchedError } = await supabase
        .from('bank_reconciliations')
        .select('transaction_id')
        .eq('account_id', accountId)
        .eq('status', 'matched')
        .not('transaction_id', 'is', null);

      if (matchedError) throw matchedError;

      const matchedTxIds = new Set(matched?.map((m) => m.transaction_id) || []);
      const availableTx = transactions?.filter((t) => !matchedTxIds.has(t.id)) || [];

      let matchedCount = 0;
      let mismatchedCount = 0;

      for (const rec of pending || []) {
        // Try to find exact match by amount and date
        const match = availableTx.find(
          (t) =>
            Math.abs(t.amount - rec.external_amount) < 0.01 &&
            t.date === rec.external_date &&
            !matchedTxIds.has(t.id)
        );

        if (match) {
          await supabase
            .from('bank_reconciliations')
            .update({ transaction_id: match.id, status: 'matched' })
            .eq('id', rec.id);
          matchedTxIds.add(match.id);
          matchedCount++;
        } else {
          // Check if there's a similar transaction (same amount, different date)
          const similar = availableTx.find(
            (t) => Math.abs(t.amount - rec.external_amount) < 0.01 && !matchedTxIds.has(t.id)
          );

          if (similar) {
            await supabase
              .from('bank_reconciliations')
              .update({ transaction_id: similar.id, status: 'mismatched' })
              .eq('id', rec.id);
            matchedTxIds.add(similar.id);
            mismatchedCount++;
          } else {
            await supabase
              .from('bank_reconciliations')
              .update({ status: 'mismatched' })
              .eq('id', rec.id);
            mismatchedCount++;
          }
        }
      }

      // Generate insight if there are mismatches
      if (mismatchedCount > 0) {
        await supabase.from('insights').insert({
          user_id: user.id,
          insight_type: 'high_expense',
          title: 'Inconsistências na Reconciliação',
          message: `Foram encontradas ${mismatchedCount} transações com inconsistências na conta. Revise as diferenças para garantir a precisão dos seus registros.`,
        });
      }

      return { matchedCount, mismatchedCount };
    },
    onSuccess: (result, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations', accountId] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success(
        `Reconciliação concluída: ${result.matchedCount} correspondências, ${result.mismatchedCount} inconsistências`
      );
    },
    onError: (error) => {
      toast.error('Erro na reconciliação automática: ' + error.message);
    },
  });
}

export function useDeleteReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('bank_reconciliations')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations', data.account_id] });
      toast.success('Registro removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });
}
