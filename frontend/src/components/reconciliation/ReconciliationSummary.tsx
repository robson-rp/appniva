import { Card, CardContent } from '@/components/ui/card';
import { BankReconciliation } from '@/hooks/useReconciliation';
import { CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface ReconciliationSummaryProps {
  reconciliations: BankReconciliation[];
  internalBalance: number;
}

export function ReconciliationSummary({
  reconciliations,
  internalBalance,
}: ReconciliationSummaryProps) {
  const matched = reconciliations.filter((r) => r.status === 'matched');
  const mismatched = reconciliations.filter((r) => r.status === 'mismatched');
  const pending = reconciliations.filter((r) => r.status === 'pending');

  const externalTotal = reconciliations.reduce((sum, r) => sum + r.external_amount, 0);
  const difference = internalBalance - externalTotal;

  const stats = [
    {
      label: 'Conciliados',
      value: matched.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Inconsistentes',
      value: mismatched.length,
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Pendentes',
      value: pending.length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Diferença',
      value: difference.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }),
      icon: TrendingUp,
      color: difference === 0 ? 'text-green-600' : 'text-destructive',
      bg: difference === 0 ? 'bg-green-500/10' : 'bg-destructive/10',
      isAmount: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${stat.isAmount ? stat.color : ''}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
