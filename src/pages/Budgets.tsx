import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useBudgetWithSpending, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard';
import { formatCurrency, formatMonth, getCurrentMonth } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Budgets() {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const { data: budgets, isLoading } = useBudgetWithSpending(selectedMonth);
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + (direction === 'next' ? 1 : -1));
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleCreate = (data: any) => {
    createBudget.mutate(data, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const handleUpdate = (data: any) => {
    if (!editingBudget) return;
    updateBudget.mutate(
      { id: editingBudget.id, amount_limit: data.amount_limit },
      { onSuccess: () => setEditingBudget(null) }
    );
  };

  const handleDelete = (id: string) => {
    deleteBudget.mutate(id);
  };

  // Calculate summary statistics
  const totalLimit = budgets?.reduce((sum, b) => sum + Number(b.amount_limit), 0) || 0;
  const totalSpent = budgets?.reduce((sum, b) => sum + b.spent, 0) || 0;
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const existingCategoryIds = budgets?.map(b => b.category_id) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('budgets.title')}</h1>
          <p className="text-muted-foreground">{t('budgets.subtitle')}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('budgets.newBudget')}
        </Button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-center gap-4 bg-card border rounded-xl p-4">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold min-w-[180px] text-center capitalize">
          {formatMonth(selectedMonth)}
        </span>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm opacity-90">{t('budgets.totalBudgeted')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalLimit)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">{t('budgets.totalSpent')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">{t('budgets.usage')}</p>
            <p className={cn(
              'text-2xl font-bold',
              overallPercentage > 100 && 'text-expense',
              overallPercentage >= 80 && overallPercentage <= 100 && 'text-warning'
            )}>
              {overallPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : budgets?.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <p className="text-muted-foreground mb-2">{t('budgets.noBudgetsThisMonth')}</p>
          <Button variant="link" onClick={() => setIsDialogOpen(true)}>
            {t('budgets.createFirstBudget')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets?.map((budget) => (
            <div key={budget.id} className="relative group">
              <BudgetProgressCard
                categoryName={budget.category?.name || 'Categoria'}
                categoryColor={budget.category?.color || '#6366f1'}
                limit={Number(budget.amount_limit)}
                spent={budget.spent}
                percentage={budget.percentage}
              />
              
              {/* Actions overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditingBudget(budget)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('budgets.deleteBudget')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('budgets.deleteBudgetDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(budget.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('budgets.newBudget')}</DialogTitle>
          </DialogHeader>
          <BudgetForm
            defaultValues={{ month: selectedMonth }}
            onSubmit={handleCreate}
            isLoading={createBudget.isPending}
            submitLabel={t('budgets.newBudget')}
            existingCategoryIds={existingCategoryIds}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('budgets.editBudget')}</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              defaultValues={{
                category_id: editingBudget.category_id,
                amount_limit: Number(editingBudget.amount_limit),
                month: editingBudget.month,
              }}
              onSubmit={handleUpdate}
              isLoading={updateBudget.isPending}
              submitLabel={t('common.update')}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
