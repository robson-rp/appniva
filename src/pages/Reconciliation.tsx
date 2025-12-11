import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import {
  useReconciliations,
  useAccountTransactions,
  useImportReconciliationData,
  useAutoReconcile,
  useReconcileTransaction,
  useDeleteReconciliation,
  BankReconciliation,
  ImportedTransaction,
} from '@/hooks/useReconciliation';
import { CSVImporter } from '@/components/reconciliation/CSVImporter';
import { OCRUploader } from '@/components/reconciliation/OCRUploader';
import { ReconciliationTable } from '@/components/reconciliation/ReconciliationTable';
import { ReconciliationSummary } from '@/components/reconciliation/ReconciliationSummary';
import { TransactionLinkDialog } from '@/components/reconciliation/TransactionLinkDialog';

export default function Reconciliation() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [selectedRec, setSelectedRec] = useState<BankReconciliation | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const { data: accounts } = useAccounts();
  const account = accounts?.find((a) => a.id === accountId);

  const { data: reconciliations, isLoading: loadingRecs } = useReconciliations(accountId || '');
  const { data: transactions, isLoading: loadingTx } = useAccountTransactions(accountId || '');

  const importMutation = useImportReconciliationData();
  const autoReconcileMutation = useAutoReconcile();
  const reconcileMutation = useReconcileTransaction();
  const deleteMutation = useDeleteReconciliation();

  const handleImport = (data: ImportedTransaction[]) => {
    if (accountId) {
      importMutation.mutate({ accountId, transactions: data });
    }
  };

  const handleAutoReconcile = () => {
    if (accountId) {
      autoReconcileMutation.mutate(accountId);
    }
  };

  const handleLinkTransaction = (rec: BankReconciliation) => {
    setSelectedRec(rec);
    setLinkDialogOpen(true);
  };

  const handleLink = (
    reconciliationId: string,
    transactionId: string,
    status: 'matched' | 'mismatched'
  ) => {
    reconcileMutation.mutate(
      { reconciliationId, transactionId, status },
      {
        onSuccess: () => setLinkDialogOpen(false),
      }
    );
  };

  const handleMarkMismatched = (reconciliationId: string) => {
    reconcileMutation.mutate(
      { reconciliationId, transactionId: null, status: 'mismatched' },
      {
        onSuccess: () => setLinkDialogOpen(false),
      }
    );
  };

  const pendingCount = reconciliations?.filter((r) => r.status === 'pending').length || 0;
  const internalBalance = account?.current_balance || 0;

  if (!accountId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Conta não especificada</p>
        <Button onClick={() => navigate('/accounts')} className="mt-4">
          Ir para Contas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/accounts')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Reconciliação Bancária</h1>
              <p className="text-muted-foreground">
                {account?.name || 'Carregando...'} -{' '}
                {internalBalance.toLocaleString('pt-AO', {
                  style: 'currency',
                  currency: 'AOA',
                })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleAutoReconcile}
            disabled={pendingCount === 0 || autoReconcileMutation.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${autoReconcileMutation.isPending ? 'animate-spin' : ''}`}
            />
            Conciliar Automaticamente ({pendingCount})
          </Button>
        </div>

        {/* Summary */}
        {loadingRecs ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <ReconciliationSummary
            reconciliations={reconciliations || []}
            internalBalance={internalBalance}
          />
        )}

        {/* Main Content */}
        <Tabs defaultValue="reconciliation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reconciliation">Reconciliação</TabsTrigger>
            <TabsTrigger value="import">Importar Dados</TabsTrigger>
            <TabsTrigger value="transactions">
              Transações Internas ({transactions?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reconciliation" className="space-y-4">
            {loadingRecs ? (
              <Skeleton className="h-64" />
            ) : (
              <ReconciliationTable
                reconciliations={reconciliations || []}
                onDelete={(id) => deleteMutation.mutate(id)}
                onLinkTransaction={handleLinkTransaction}
                isDeleting={deleteMutation.isPending}
              />
            )}
          </TabsContent>

          <TabsContent value="import">
            <div className="grid md:grid-cols-2 gap-6">
              <CSVImporter onImport={handleImport} isLoading={importMutation.isPending} />
              <OCRUploader onImport={handleImport} isImporting={importMutation.isPending} />
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="pt-6">
                {loadingTx ? (
                  <Skeleton className="h-64" />
                ) : transactions?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhuma transação registrada nesta conta.
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left">Data</th>
                          <th className="p-3 text-left">Descrição</th>
                          <th className="p-3 text-left">Tipo</th>
                          <th className="p-3 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions?.slice(0, 50).map((tx) => (
                          <tr key={tx.id} className="border-t">
                            <td className="p-3">{new Date(tx.date).toLocaleDateString('pt-AO')}</td>
                            <td className="p-3">{tx.description || '-'}</td>
                            <td className="p-3">
                              <span
                                className={
                                  tx.type === 'income'
                                    ? 'text-green-600'
                                    : tx.type === 'expense'
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                }
                              >
                                {tx.type === 'income'
                                  ? 'Receita'
                                  : tx.type === 'expense'
                                  ? 'Despesa'
                                  : 'Transferência'}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono">
                              {tx.amount.toLocaleString('pt-AO', {
                                style: 'currency',
                                currency: 'AOA',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TransactionLinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        reconciliation={selectedRec}
        transactions={transactions || []}
        onLink={handleLink}
        onMarkMismatched={handleMarkMismatched}
        isLoading={reconcileMutation.isPending}
      />
    </div>
  );
}
