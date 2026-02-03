import { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useCostCenterBudgetsWithSpending,
  useCreateCostCenterBudget,
  useUpdateCostCenterBudget,
  useDeleteCostCenterBudget,
  CostCenterBudgetWithSpending,
} from '@/hooks/useCostCenterBudgets';
import { CostCenterBudgetForm } from './CostCenterBudgetForm';
import { CostCenterBudgetAlerts } from './CostCenterBudgetAlerts';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const CostCenterBudgetList = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CostCenterBudgetWithSpending | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: budgets, isLoading } = useCostCenterBudgetsWithSpending(selectedMonth);
  const createMutation = useCreateCostCenterBudget();
  const updateMutation = useUpdateCostCenterBudget();
  const deleteMutation = useDeleteCostCenterBudget();

  const existingCenterIds = budgets?.map((b) => b.cost_center_id) || [];

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const handleUpdate = (data: any) => {
    if (editingBudget) {
      updateMutation.mutate(
        { id: editingBudget.id, ...data },
        { onSuccess: () => setEditingBudget(null) }
      );
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  };

  const getProgressColor = (budget: CostCenterBudgetWithSpending) => {
    if (budget.isOverBudget) return 'bg-destructive';
    if (budget.isNearLimit) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Orçamentos por Centro</h2>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Alerts */}
      {budgets && budgets.length > 0 && (
        <CostCenterBudgetAlerts budgets={budgets} />
      )}

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[180px]" />
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id} className="relative overflow-hidden">
              <div
                className={cn(
                  'absolute top-0 left-0 w-1 h-full',
                  budget.isOverBudget
                    ? 'bg-destructive'
                    : budget.isNearLimit
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                )}
              />
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    {budget.cost_center?.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Limite: {formatCurrency(budget.amount_limit)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingBudget(budget)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeletingId(budget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gasto</span>
                    <span
                      className={cn(
                        'font-medium',
                        budget.isOverBudget && 'text-destructive'
                      )}
                    >
                      {formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className={cn('h-2', getProgressColor(budget))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{budget.percentage.toFixed(1)}% utilizado</span>
                    <span>
                      Restante: {formatCurrency(Math.max(0, budget.amount_limit - budget.spent))}
                    </span>
                  </div>
                </div>

                {budget.isOverBudget && (
                  <Badge variant="destructive" className="text-xs">
                    Excedido em {formatCurrency(budget.spent - budget.amount_limit)}
                  </Badge>
                )}
                {budget.isNearLimit && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                    Próximo do limite ({budget.alert_threshold}%)
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <TrendingDown className="h-12 w-12 mb-4 opacity-50" />
            <p>Nenhum orçamento definido para este mês</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro orçamento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <CostCenterBudgetForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
            defaultValues={{ month: selectedMonth }}
            existingCenterIds={existingCenterIds}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Orçamento</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <CostCenterBudgetForm
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              defaultValues={{
                cost_center_id: editingBudget.cost_center_id,
                month: editingBudget.month,
                amount_limit: editingBudget.amount_limit,
                alert_threshold: editingBudget.alert_threshold,
              }}
              existingCenterIds={existingCenterIds}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este orçamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
