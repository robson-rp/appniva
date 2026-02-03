import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';
import { useAccounts } from '@/hooks/useAccounts';
import { useInvestments } from '@/hooks/useInvestments';
import { useDebts } from '@/hooks/useDebts';
import { formatCompactCurrency } from '@/lib/constants';
import { Loader2, TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from 'recharts';

export default function NetWorthHistory() {
  const [period, setPeriod] = useState('12');
  const { data: history, isLoading } = useNetWorthHistory(parseInt(period));
  const { data: accounts } = useAccounts();
  const { data: investments } = useInvestments();
  const { data: debts } = useDebts();

  const currentNetWorth = history?.[history.length - 1]?.netWorth || 0;
  const previousNetWorth = history?.[history.length - 2]?.netWorth || 0;
  const netWorthChange = currentNetWorth - previousNetWorth;
  const netWorthChangePercent = previousNetWorth !== 0 ? (netWorthChange / previousNetWorth) * 100 : 0;

  const totalAccounts = accounts?.reduce((sum, acc) => sum + acc.current_balance, 0) || 0;
  const totalInvestments = investments?.reduce((sum, inv) => sum + inv.principal_amount, 0) || 0;
  const totalDebts = debts?.filter(d => d.status === 'active').reduce((sum, d) => sum + d.current_balance, 0) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico de Património</h1>
            <p className="text-muted-foreground">Evolução do seu património líquido ao longo do tempo</p>
          </div>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 meses</SelectItem>
            <SelectItem value="12">12 meses</SelectItem>
            <SelectItem value="24">24 meses</SelectItem>
            <SelectItem value="36">3 anos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {netWorthChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">Património Líquido</span>
            </div>
            <div className="mt-2 text-2xl font-bold truncate" title={formatCurrency(currentNetWorth)}>
              {formatCompactCurrency(currentNetWorth)}
            </div>
            <p className={`text-sm ${netWorthChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netWorthChange >= 0 ? '+' : ''}{netWorthChangePercent.toFixed(1)}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Contas</span>
            </div>
            <div className="mt-2 text-2xl font-bold truncate" title={formatCurrency(totalAccounts)}>
              {formatCompactCurrency(totalAccounts)}
            </div>
            <p className="text-sm text-muted-foreground">{accounts?.length || 0} contas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Investimentos</span>
            </div>
            <div className="mt-2 text-2xl font-bold truncate" title={formatCurrency(totalInvestments)}>
              {formatCompactCurrency(totalInvestments)}
            </div>
            <p className="text-sm text-muted-foreground">{investments?.length || 0} investimentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Dívidas</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-red-500 truncate" title={formatCurrency(totalDebts)}>
              {formatCompactCurrency(totalDebts)}
            </div>
            <p className="text-sm text-muted-foreground">{debts?.filter(d => d.status === 'active').length || 0} activas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="composition">Composição</TabsTrigger>
          <TabsTrigger value="comparison">Activos vs Passivos</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Património Líquido</CardTitle>
              <CardDescription>
                Variação do seu património ao longo dos últimos {period} meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="monthLabel" 
                      className="text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      name="Património Líquido"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composition">
          <Card>
            <CardHeader>
              <CardTitle>Composição do Património</CardTitle>
              <CardDescription>
                Distribuição entre contas, investimentos e dívidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="monthLabel" 
                      className="text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="accounts"
                      name="Contas"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="investments"
                      name="Investimentos"
                      stackId="1"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Activos vs Passivos</CardTitle>
              <CardDescription>
                Comparação entre o total de activos e passivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="monthLabel" 
                      className="text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="assets" 
                      name="Activos" 
                      fill="hsl(var(--chart-2))" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="liabilities" 
                      name="Passivos" 
                      fill="hsl(var(--destructive))" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="netWorth"
                      name="Património Líquido"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Análise do Património</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium">Taxa de Crescimento</h4>
              <p className="mt-1 text-2xl font-bold text-primary">
                {netWorthChangePercent >= 0 ? '+' : ''}{netWorthChangePercent.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Variação mensal</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-medium">Rácio Dívida/Activos</h4>
              <p className="mt-1 text-2xl font-bold">
                {((totalDebts / (totalAccounts + totalInvestments)) * 100 || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                {totalDebts / (totalAccounts + totalInvestments) < 0.3 ? 'Saudável' : 'Atenção necessária'}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-medium">Investimentos/Património</h4>
              <p className="mt-1 text-2xl font-bold">
                {((totalInvestments / (totalAccounts + totalInvestments)) * 100 || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Alocação em investimentos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
