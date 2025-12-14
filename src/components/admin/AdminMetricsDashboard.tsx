import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpDown, Users, Receipt } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompact = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const COLORS = ['hsl(var(--income))', 'hsl(var(--expense))', 'hsl(var(--primary))'];

export function AdminMetricsDashboard() {
  const { data: metrics, isLoading } = useAdminMetrics(6);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!metrics) return null;

  const summaryCards = [
    {
      title: 'Volume Total',
      value: formatCurrency(metrics.totalVolume),
      description: 'Últimos 6 meses',
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total de Receitas',
      value: formatCurrency(metrics.totalIncome),
      description: 'Entradas registadas',
      icon: TrendingUp,
      color: 'text-income',
      bgColor: 'bg-income/10',
    },
    {
      title: 'Total de Despesas',
      value: formatCurrency(metrics.totalExpense),
      description: 'Saídas registadas',
      icon: TrendingDown,
      color: 'text-expense',
      bgColor: 'bg-expense/10',
    },
    {
      title: 'Valor Médio',
      value: formatCurrency(metrics.avgTransactionValue),
      description: 'Por transacção',
      icon: ArrowUpDown,
      color: 'text-accent-teal',
      bgColor: 'bg-accent-teal/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendência Financeira
            </CardTitle>
            <CardDescription>Evolução de receitas e despesas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="monthLabel" className="text-xs fill-muted-foreground" />
                  <YAxis tickFormatter={formatCompact} className="text-xs fill-muted-foreground" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'income' ? 'Receitas' : 'Despesas',
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--income))"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="hsl(var(--expense))"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transactions by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Transacções por Tipo
            </CardTitle>
            <CardDescription>Distribuição por quantidade e volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.transactionsByType} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="type" className="text-xs fill-muted-foreground" />
                  <YAxis yAxisId="left" className="text-xs fill-muted-foreground" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={formatCompact} className="text-xs fill-muted-foreground" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'count' ? value : formatCurrency(value),
                      name === 'count' ? 'Quantidade' : 'Volume',
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend formatter={(value) => (value === 'count' ? 'Quantidade' : 'Volume')} />
                  <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--accent-teal))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Users Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Novos Utilizadores
            </CardTitle>
            <CardDescription>Registos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.monthlyTrends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="monthLabel" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    formatter={(value: number) => [value, 'Novos utilizadores']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="newUsers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Utilizadores" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
          <CardDescription>Detalhes por mês dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium text-muted-foreground">Mês</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">Transacções</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">Receitas</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">Despesas</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">Saldo</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">Novos Utilizadores</th>
                </tr>
              </thead>
              <tbody>
                {metrics.monthlyTrends.map((m) => (
                  <tr key={m.month} className="border-b last:border-0">
                    <td className="py-3 font-medium">{m.monthLabel} {m.month.slice(0, 4)}</td>
                    <td className="py-3 text-right">{m.transactionCount.toLocaleString('pt-PT')}</td>
                    <td className="py-3 text-right text-income">{formatCurrency(m.income)}</td>
                    <td className="py-3 text-right text-expense">{formatCurrency(m.expense)}</td>
                    <td className={`py-3 text-right font-medium ${m.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                      {formatCurrency(m.balance)}
                    </td>
                    <td className="py-3 text-right">{m.newUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
