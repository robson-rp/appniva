import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTransactions, useCreateTransaction, useDeleteTransaction, useMonthlyStats } from '@/hooks/useTransactions';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { formatCurrency, getCurrentMonth } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    accountId?: string;
    type?: 'income' | 'expense' | 'transfer';
    categoryId?: string;
  }>({});

  const { data: transactions, isLoading } = useTransactions(filters);
  const { data: stats } = useMonthlyStats(getCurrentMonth());
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const handleCreate = (data: any) => {
    // Clean up optional fields
    const payload = {
      ...data,
      category_id: data.category_id || null,
      related_account_id: data.related_account_id || null,
      description: data.description || null,
    };
    
    createTransaction.mutate(payload, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transacções</h1>
          <p className="text-muted-foreground">Registe e consulte movimentos financeiros</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transacção
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Receitas do Mês</p>
          <p className="text-2xl font-bold text-income">
            +{formatCurrency(stats?.income || 0)}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Despesas do Mês</p>
          <p className="text-2xl font-bold text-expense">
            -{formatCurrency(stats?.expense || 0)}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Saldo do Mês</p>
          <p className={cn(
            'text-2xl font-bold',
            (stats?.balance || 0) >= 0 ? 'text-income' : 'text-expense'
          )}>
            {formatCurrency(stats?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <TransactionFilters filters={filters} onFiltersChange={setFilters} />
        </CollapsibleContent>
      </Collapsible>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <TransactionsTable
          transactions={transactions || []}
          onDelete={handleDelete}
          isDeleting={deleteTransaction.isPending}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Transacção</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleCreate}
            isLoading={createTransaction.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
