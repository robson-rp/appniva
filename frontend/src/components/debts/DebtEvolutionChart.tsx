import { useMemo } from 'react';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import type { Debt, DebtPayment } from '@/hooks/useDebts';

interface DebtEvolutionChartProps {
  debts: Debt[];
  payments: DebtPayment[];
}

export function DebtEvolutionChart({ debts, payments }: DebtEvolutionChartProps) {
  const chartData = useMemo(() => {
    if (!debts.length) return [];

    // Get date range: from earliest debt creation to now
    const now = new Date();
    const earliestDebt = debts.reduce((earliest, debt) => {
      const createdAt = debt.created_at ? new Date(debt.created_at) : now;
      return createdAt < earliest ? createdAt : earliest;
    }, now);

    // Generate months from earliest debt to now (max 12 months back)
    const startDate = startOfMonth(
      earliestDebt > subMonths(now, 11) ? earliestDebt : subMonths(now, 11)
    );
    const months = eachMonthOfInterval({ start: startDate, end: now });

    // Calculate total principal at the start
    const totalPrincipal = debts.reduce((sum, d) => sum + d.principal_amount, 0);

    // Group payments by month
    const paymentsByMonth = payments.reduce((acc, payment) => {
      const monthKey = format(startOfMonth(parseISO(payment.payment_date)), 'yyyy-MM');
      acc[monthKey] = (acc[monthKey] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // Build cumulative data
    let cumulativePayments = 0;
    
    // Calculate payments before the start date
    payments.forEach(payment => {
      const paymentDate = parseISO(payment.payment_date);
      if (paymentDate < startDate) {
        cumulativePayments += payment.amount;
      }
    });

    return months.map(month => {
      const monthKey = format(month, 'yyyy-MM');
      cumulativePayments += paymentsByMonth[monthKey] || 0;
      const balance = Math.max(0, totalPrincipal - cumulativePayments);

      return {
        month: format(month, 'MMM yyyy', { locale: pt }),
        balance,
        paid: cumulativePayments,
      };
    });
  }, [debts, payments]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!chartData.length || debts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          Evolução da Dívida
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => [
                  formatTooltipValue(value),
                  name === 'balance' ? 'Saldo Devedor' : 'Total Pago',
                ]}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--destructive))"
                fillOpacity={1}
                fill="url(#colorBalance)"
                strokeWidth={2}
                name="balance"
              />
              <Area
                type="monotone"
                dataKey="paid"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorPaid)"
                strokeWidth={2}
                name="paid"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Saldo Devedor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Total Pago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
