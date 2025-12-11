import { useAccounts } from '@/hooks/useAccounts';
import { useMonthlyStats, useExpensesByCategory, useRecentTransactions, useMonthlyTrends } from '@/hooks/useTransactions';
import { useInvestmentStats } from '@/hooks/useInvestments';
import { useActiveGoals } from '@/hooks/useGoals';
import { useInsights } from '@/hooks/useInsights';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, Lightbulb, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FinancialScoreCard } from '@/components/dashboard/FinancialScoreCard';

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: monthlyStats, isLoading: loadingStats } = useMonthlyStats();
  const { data: expensesByCategory, isLoading: loadingExpenses } = useExpensesByCategory();
  const { data: investmentStats, isLoading: loadingInvestments } = useInvestmentStats();
  const { data: goals, isLoading: loadingGoals } = useActiveGoals();
  const { data: insights } = useInsights();
  const { data: recentTransactions } = useRecentTransactions(5);
  const { data: monthlyTrends, isLoading: loadingTrends } = useMonthlyTrends(6);

  const currency = profile?.primary_currency || 'AOA';
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0;
  const totalInvested = investmentStats?.total || 0;
  const netWorth = totalBalance + totalInvested;

  const isLoading = loadingAccounts || loadingStats || loadingExpenses || loadingInvestments || loadingGoals || loadingTrends;

  const chartConfig = {
    income: {
      label: "Receitas",
      color: "hsl(var(--income))",
    },
    expense: {
      label: "Despesas", 
      color: "hsl(var(--expense))",
    },
    balance: {
      label: "Balanço",
      color: "hsl(var(--accent))",
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {profile?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Aqui está o resumo das tuas finanças</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Património Líquido</p>
                <p className="text-2xl font-bold">{formatCurrency(netWorth, currency)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas do Mês</p>
                <p className="text-2xl font-bold text-income">{formatCurrency(monthlyStats?.income || 0, currency)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-income/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-income" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas do Mês</p>
                <p className="text-2xl font-bold text-expense">{formatCurrency(monthlyStats?.expense || 0, currency)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-expense/10 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-expense" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investimentos</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvested, currency)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tendências Mensais (Últimos 6 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrends && monthlyTrends.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="monthLabel" className="text-xs fill-muted-foreground" />
                <YAxis 
                  className="text-xs fill-muted-foreground" 
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value;
                  }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [formatCurrency(Number(value), currency), name === 'income' ? 'Receitas' : 'Despesas']}
                  />} 
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(var(--income))" 
                  fillOpacity={1} 
                  fill="url(#incomeGradient)"
                  strokeWidth={2}
                  name="income"
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="hsl(var(--expense))" 
                  fillOpacity={1} 
                  fill="url(#expenseGradient)"
                  strokeWidth={2}
                  name="expense"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Sem dados suficientes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income vs Expense Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrends && monthlyTrends.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="monthLabel" className="text-xs fill-muted-foreground" />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value;
                  }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [formatCurrency(Number(value), currency), name === 'income' ? 'Receitas' : 'Despesas']}
                  />} 
                />
                <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} name="income" />
                <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} name="expense" />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              Sem dados suficientes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Score */}
      <FinancialScoreCard />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory && expensesByCategory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expensesByCategory.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Sem despesas este mês
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Metas em Progresso</CardTitle>
            <Link to="/goals" className="text-sm text-accent hover:underline">Ver todas</Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals && goals.length > 0 ? (
              goals.slice(0, 3).map((goal) => {
                const progress = goal.target_amount > 0
                  ? Math.round((Number(goal.current_saved_amount) / Number(goal.target_amount)) * 100)
                  : 0;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Number(goal.current_saved_amount), goal.currency)} de {formatCurrency(Number(goal.target_amount), goal.currency)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <Link to="/goals" className="text-accent hover:underline">Criar primeira meta</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transacções Recentes</CardTitle>
          <Link to="/transactions" className="text-sm text-accent hover:underline">Ver todas</Link>
        </CardHeader>
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: t.category?.color || '#6b7280' }}
                    />
                    <div>
                      <p className="font-medium text-sm">{t.description || t.category?.name || 'Transacção'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)} • {t.account?.name}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${t.type === 'income' ? 'text-income' : t.type === 'expense' ? 'text-expense' : 'text-transfer'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount), t.currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <Link to="/transactions" className="text-accent hover:underline">Adicionar primeira transacção</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
