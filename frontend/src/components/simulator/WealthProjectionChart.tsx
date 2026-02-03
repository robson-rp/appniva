import { useMemo } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyProjection, GoalProjection } from '@/lib/simulationEngine';

interface WealthProjectionChartProps {
  projections: MonthlyProjection[];
  goalProjections: GoalProjection[];
  breakEvenMonth: number | null;
}

export function WealthProjectionChart({ 
  projections, 
  goalProjections,
  breakEvenMonth 
}: WealthProjectionChartProps) {
  const chartData = useMemo(() => {
    // Sample every 3 months for cleaner chart
    return projections
      .filter((_, i) => i % 3 === 0 || i === projections.length - 1)
      .map(p => ({
        date: format(p.date, 'MMM yyyy', { locale: pt }),
        month: p.month,
        'Património Nominal': Math.round(p.wealth),
        'Património Real': Math.round(p.realWealth),
      }));
  }, [projections]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  // Find goal lines
  const goalLines = goalProjections.map(gp => ({
    name: gp.name,
    value: gp.targetAmount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção do Património</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="realWealthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                    minimumFractionDigits: 0,
                  }).format(value),
                ]}
              />
              <Legend />
              
              {/* Goal reference lines */}
              {goalLines.map((goal, i) => (
                <ReferenceLine 
                  key={i}
                  y={goal.value} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: goal.name, 
                    position: 'right',
                    fontSize: 10,
                    fill: 'hsl(var(--destructive))'
                  }}
                />
              ))}

              <Area
                type="monotone"
                dataKey="Património Nominal"
                stroke="hsl(var(--primary))"
                fill="url(#wealthGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Património Real"
                stroke="hsl(var(--muted-foreground))"
                fill="url(#realWealthGradient)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          * Património Real ajustado pela inflação projetada
        </p>
      </CardContent>
    </Card>
  );
}
