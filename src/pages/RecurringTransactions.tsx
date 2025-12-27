import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, RefreshCw, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecurringTransactionForm } from '@/components/recurring/RecurringTransactionForm';
import { RecurringTransactionCard } from '@/components/recurring/RecurringTransactionCard';
import {
  useRecurringTransactions,
  RecurringTransaction,
} from '@/hooks/useRecurringTransactions';

export default function RecurringTransactionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | null>(null);
  const { data: transactions, isLoading } = useRecurringTransactions();

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  const activeTransactions = transactions?.filter((t) => t.is_active) || [];
  const pausedTransactions = transactions?.filter((t) => !t.is_active) || [];

  const monthlyIncome = activeTransactions
    .filter((t) => t.type === 'income' && t.frequency === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = activeTransactions
    .filter((t) => t.type === 'expense' && t.frequency === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Transações Recorrentes | Bolso Inteligente</title>
        <meta
          name="description"
          content="Gerencie suas transações recorrentes automáticas"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Transações Recorrentes
            </h1>
            <p className="text-muted-foreground">
              Configure pagamentos e receitas automáticas
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Recorrente
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activas</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                transações programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Mensais</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {formatCurrency(monthlyIncome)}
              </div>
              <p className="text-xs text-muted-foreground">receitas recorrentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500">
                {formatCurrency(monthlyExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">despesas recorrentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Activas ({activeTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Pausadas ({pausedTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : activeTransactions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">Nenhuma transação recorrente</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-1">
                    Crie transações recorrentes para automatizar pagamentos mensais,
                    salários e outras transações regulares.
                  </p>
                  <Button className="mt-4" onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeTransactions.map((transaction) => (
                  <RecurringTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            {pausedTransactions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">Nenhuma transação pausada</h3>
                  <p className="text-muted-foreground">
                    As transações pausadas aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pausedTransactions.map((transaction) => (
                  <RecurringTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <RecurringTransactionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        editingTransaction={editingTransaction}
      />
    </>
  );
}
