import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CostCenterBudgetWithSpending } from '@/hooks/useCostCenterBudgets';
import { formatCurrency } from '@/lib/utils';

interface CostCenterBudgetAlertsProps {
  budgets: CostCenterBudgetWithSpending[];
}

export const CostCenterBudgetAlerts = ({ budgets }: CostCenterBudgetAlertsProps) => {
  const overBudget = budgets.filter((b) => b.isOverBudget);
  const nearLimit = budgets.filter((b) => b.isNearLimit);

  if (overBudget.length === 0 && nearLimit.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {overBudget.map((budget) => (
        <Alert key={budget.id} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Orçamento Excedido</AlertTitle>
          <AlertDescription>
            <strong>{budget.cost_center?.name}</strong> ultrapassou o limite em{' '}
            {formatCurrency(budget.spent - budget.amount_limit)}.
            Gasto: {formatCurrency(budget.spent)} / Limite: {formatCurrency(budget.amount_limit)}
            ({budget.percentage.toFixed(1)}%)
          </AlertDescription>
        </Alert>
      ))}

      {nearLimit.map((budget) => (
        <Alert 
          key={budget.id} 
          className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção ao Limite</AlertTitle>
          <AlertDescription>
            <strong>{budget.cost_center?.name}</strong> atingiu{' '}
            {budget.percentage.toFixed(1)}% do orçamento.
            Gasto: {formatCurrency(budget.spent)} / Limite: {formatCurrency(budget.amount_limit)}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
