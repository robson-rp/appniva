import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BudgetProgressCardProps {
  categoryName: string;
  categoryColor: string;
  limit: number;
  spent: number;
  percentage: number;
  currency?: string;
}

export function BudgetProgressCard({
  categoryName,
  categoryColor,
  limit,
  spent,
  percentage,
  currency = 'AOA',
}: BudgetProgressCardProps) {
  const remaining = limit - spent;
  const isOverBudget = percentage > 100;
  const isWarning = percentage >= 80 && percentage <= 100;
  const isHealthy = percentage < 80;

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="font-medium text-foreground">{categoryName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOverBudget && (
            <AlertTriangle className="h-4 w-4 text-expense" />
          )}
          {isWarning && (
            <TrendingUp className="h-4 w-4 text-warning" />
          )}
          {isHealthy && (
            <CheckCircle2 className="h-4 w-4 text-income" />
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              isOverBudget && 'text-expense',
              isWarning && 'text-warning',
              isHealthy && 'text-income'
            )}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <Progress
        value={Math.min(percentage, 100)}
        className={cn(
          'h-2',
          isOverBudget && '[&>div]:bg-expense',
          isWarning && '[&>div]:bg-warning',
          isHealthy && '[&>div]:bg-income'
        )}
      />

      <div className="flex justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Gasto: </span>
          <span className={cn(
            'font-medium',
            isOverBudget && 'text-expense'
          )}>
            {formatCurrency(spent, currency)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Limite: </span>
          <span className="font-medium">{formatCurrency(limit, currency)}</span>
        </div>
      </div>

      {isOverBudget ? (
        <div className="bg-expense/10 text-expense text-xs px-2 py-1.5 rounded-lg text-center">
          Ultrapassou o limite em {formatCurrency(Math.abs(remaining), currency)}
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground text-xs px-2 py-1.5 rounded-lg text-center">
          Restam {formatCurrency(remaining, currency)}
        </div>
      )}
    </div>
  );
}
