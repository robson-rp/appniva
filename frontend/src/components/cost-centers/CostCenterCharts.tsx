import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CostCenterWithStats } from '@/hooks/useCostCenters';
import { formatCurrency } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface CostCenterChartsProps {
  centers: CostCenterWithStats[];
}

export const CostCenterCharts = ({ centers }: CostCenterChartsProps) => {
  const expenseCenters = centers.filter((c) => c.type === 'expense_center');
  const incomeCenters = centers.filter((c) => c.type === 'income_center');

  const pieData = expenseCenters
    .filter((c) => c.total_amount > 0)
    .map((c) => ({
      name: c.name,
      value: c.total_amount,
    }));

  const barData = centers
    .filter((c) => c.total_amount > 0)
    .map((c) => ({
      name: c.name,
      total: c.total_amount,
      type: c.type === 'income_center' ? 'Receita' : 'Despesa',
    }));

  const totalExpenses = expenseCenters.reduce((sum, c) => sum + c.total_amount, 0);
  const totalIncome = incomeCenters.reduce((sum, c) => sum + c.total_amount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Desempenho por Centro</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatCurrency(value)}
                  className="text-xs"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelClassName="font-medium"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-muted-foreground">Total Receitas</p>
              <p className="text-2xl font-bold text-emerald-500">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {incomeCenters.length} centro(s)
              </p>
            </div>

            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-muted-foreground">Total Despesas</p>
              <p className="text-2xl font-bold text-rose-500">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {expenseCenters.length} centro(s)
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0 
                  ? 'text-emerald-500' 
                  : 'text-rose-500'
              }`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {centers.length} centro(s) total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
