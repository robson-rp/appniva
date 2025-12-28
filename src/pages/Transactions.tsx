import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions, useCreateTransaction, useDeleteTransaction, useMonthlyStats } from '@/hooks/useTransactions';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { TagsAggregation } from '@/components/transactions/TagsAggregation';
import { DuplicateDetector } from '@/components/transactions/DuplicateDetector';
import { formatCurrency, getCurrentMonth } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Transactions() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    accountId?: string;
    type?: 'income' | 'expense' | 'transfer';
    categoryId?: string;
    costCenterId?: string;
    tagId?: string;
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
      cost_center_id: data.cost_center_id || null,
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
          <h1 className="text-2xl font-bold text-foreground">{t('transactions.title')}</h1>
          <p className="text-muted-foreground">{t('transactions.subtitle')}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('transactions.newTransaction')}
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">{t('transactions.monthlyIncome')}</p>
          <p className="text-2xl font-bold text-income">
            +{formatCurrency(stats?.income || 0)}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">{t('transactions.monthlyExpense')}</p>
          <p className="text-2xl font-bold text-expense">
            -{formatCurrency(stats?.expense || 0)}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">{t('transactions.monthlyBalance')}</p>
          <p className={cn(
            'text-2xl font-bold',
            (stats?.balance || 0) >= 0 ? 'text-income' : 'text-expense'
          )}>
            {formatCurrency(stats?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Tabs for List and Tags */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">{t('transactions.list')}</TabsTrigger>
          <TabsTrigger value="tags">{t('transactions.byTags')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Duplicate Detector */}
          <DuplicateDetector transactions={transactions} />

          {/* Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {showFilters ? t('transactions.hideFilters') : t('transactions.showFilters')}
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
        </TabsContent>

        <TabsContent value="tags">
          <TagsAggregation />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('transactions.newTransaction')}</DialogTitle>
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
