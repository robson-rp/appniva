import { useAccounts } from '@/hooks/useAccounts';
import { useMonthlyStats } from '@/hooks/useTransactions';
import { useUpcomingRenewals, useSubscriptionStats } from '@/hooks/useSubscriptions';
import { useBudgetWithSpending } from '@/hooks/useBudgets';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingDown, 
  CalendarClock, 
  AlertTriangle,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';

export function FinancialSummaryWidget() {
  const { profile } = useAuth();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: monthlyStats, isLoading: loadingStats } = useMonthlyStats();
  const upcomingRenewals = useUpcomingRenewals(7);
  const subscriptionStats = useSubscriptionStats();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data: budgets, isLoading: loadingBudgets } = useBudgetWithSpending(currentMonth);

  const currency = profile?.primary_currency || 'AOA';
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0;
  const monthlyExpenses = monthlyStats?.expense || 0;
  const monthlyIncome = monthlyStats?.income || 0;
  const balance = monthlyIncome - monthlyExpenses;

  const isLoading = loadingAccounts || loadingStats || loadingBudgets;

  // Find budgets over threshold (80%+)
  const budgetsAtRisk = budgets?.filter(b => b.percentage >= 80) || [];

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-accent/30 p-6">
          <Skeleton className="h-6 w-32 bg-primary-foreground/20 mb-4" />
          <Skeleton className="h-10 w-48 bg-primary-foreground/20" />
        </div>
        <CardContent className="p-4">
          <div className="grid gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header with total balance */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent/30 p-6 text-primary-foreground">
        <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium">Saldo Total</span>
        </div>
        <p className="text-3xl font-bold tracking-tight">
          {formatCurrency(totalBalance, currency)}
        </p>
        <p className="text-sm text-primary-foreground/70 mt-1">
          {accounts?.length || 0} conta{accounts?.length !== 1 ? 's' : ''} activa{accounts?.length !== 1 ? 's' : ''}
        </p>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Monthly summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-income-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Receitas do mês</p>
            <p className="text-lg font-semibold text-income">
              +{formatCurrency(monthlyIncome, currency)}
            </p>
          </div>
          <div className="bg-expense-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Despesas do mês</p>
            <p className="text-lg font-semibold text-expense">
              -{formatCurrency(monthlyExpenses, currency)}
            </p>
          </div>
        </div>

        {/* Balance indicator */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${balance >= 0 ? 'bg-income-muted' : 'bg-expense-muted'}`}>
          <div className="flex items-center gap-2">
            <TrendingDown className={`h-4 w-4 ${balance >= 0 ? 'text-income rotate-180' : 'text-expense'}`} />
            <span className="text-sm font-medium">Balanço do mês</span>
          </div>
          <span className={`font-semibold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance, currency)}
          </span>
        </div>

        {/* Upcoming renewals */}
        {upcomingRenewals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Próximas renovações</span>
              </div>
              <Link to="/subscriptions" className="text-xs text-accent hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingRenewals.slice(0, 3).map((sub) => {
                const daysUntil = differenceInDays(new Date(sub.next_renewal_date), new Date());
                return (
                  <div key={sub.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `Em ${daysUntil} dias`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-expense">
                      {formatCurrency(sub.amount, sub.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscription summary */}
        {subscriptionStats.totalActive > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">{subscriptionStats.totalActive} subscrições activas</p>
              <p className="text-xs text-muted-foreground">Custo mensal estimado</p>
            </div>
            <span className="text-lg font-semibold text-expense">
              {formatCurrency(subscriptionStats.monthlyTotal, currency)}
            </span>
          </div>
        )}

        {/* Budget alerts */}
        {budgetsAtRisk.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Orçamentos em risco</span>
            </div>
            <div className="space-y-2">
              {budgetsAtRisk.slice(0, 2).map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-2 bg-warning-muted rounded-lg">
                  <span className="text-sm">{budget.category?.name}</span>
                  <Badge variant={budget.percentage >= 100 ? 'destructive' : 'secondary'}>
                    {budget.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
