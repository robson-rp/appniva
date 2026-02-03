import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInflationAdjustedExpenses, useInflationRates } from '@/hooks/useInflationRates';
import { formatCurrency, formatMonth } from '@/lib/constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function InflationAlerts() {
  const { monthlyData, comparison, hasInflationData } = useInflationAdjustedExpenses();
  const { data: inflationRates = [], isLoading } = useInflationRates();

  const chartData = monthlyData.slice(0, 12).reverse().map(d => ({
    month: formatMonth(d.month),
    nominal: d.nominal,
    real: d.real,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Alertas de Inflação</h1>
          <p className="text-muted-foreground">Comparar despesas mês a mês ajustadas à inflação</p>
        </div>
      </div>

      {!hasInflationData && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Dados de Inflação Indisponíveis</h3>
                <p className="text-sm text-muted-foreground">
                  Ainda não existem taxas de inflação registadas. Os valores reais são apresentados sem ajuste.
                  Adicione taxas de inflação na base de dados para ver análises ajustadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Cards */}
      {comparison && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(comparison.currentMonth.nominal, 'AOA')}</p>
              <p className="text-xs text-muted-foreground">Valor nominal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Mês Anterior</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(comparison.previousMonth.nominal, 'AOA')}</p>
              <p className="text-xs text-muted-foreground">Valor nominal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Variação Nominal
                {comparison.nominalChangePercent > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${comparison.nominalChangePercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {comparison.nominalChangePercent > 0 ? '+' : ''}{comparison.nominalChangePercent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Math.abs(comparison.nominalChange), 'AOA')} {comparison.nominalChange > 0 ? 'a mais' : 'a menos'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Variação Real
                {comparison.realChangePercent > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${comparison.realChangePercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {comparison.realChangePercent > 0 ? '+' : ''}{comparison.realChangePercent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Ajustado à inflação</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolução das Despesas
            </CardTitle>
            <CardDescription>Comparação entre valores nominais e reais (ajustados à inflação)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, 'AOA')}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="nominal"
                    name="Valor Nominal"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="real"
                    name="Valor Real"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes Mensais</CardTitle>
          <CardDescription>Análise mês a mês das suas despesas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : monthlyData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Sem dados de transações para analisar.
            </p>
          ) : (
            <div className="space-y-3">
              {monthlyData.slice(0, 12).map((data, index) => (
                <div key={data.month} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{formatMonth(data.month)}</p>
                    <p className="text-sm text-muted-foreground">{data.transactionCount} transações</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(data.nominal, 'AOA')}</p>
                    {hasInflationData && data.inflationFactor !== 1 && (
                      <p className="text-sm text-muted-foreground">
                        Real: {formatCurrency(data.real, 'AOA')}
                      </p>
                    )}
                  </div>
                  <div className="w-24 text-right">
                    {index > 0 && monthlyData[index - 1] && (
                      <Badge variant={
                        data.nominal > monthlyData[index - 1].nominal ? 'destructive' : 'default'
                      }>
                        {data.nominal > monthlyData[index - 1].nominal ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {(((data.nominal - monthlyData[index - 1].nominal) / monthlyData[index - 1].nominal) * 100).toFixed(0)}%
                      </Badge>
                    )}
                    {index === 0 && <Badge variant="outline">Atual</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inflation Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Taxas de Inflação Registadas</CardTitle>
          <CardDescription>Histórico de taxas de inflação para Angola</CardDescription>
        </CardHeader>
        <CardContent>
          {inflationRates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma taxa de inflação registada.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {inflationRates.slice(0, 12).map((rate) => (
                <div key={rate.id} className="p-4 rounded-lg border">
                  <p className="font-medium">{formatMonth(rate.month)}</p>
                  <p className="text-2xl font-bold text-primary">{rate.annual_rate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Taxa anual</p>
                  {rate.monthly_rate && (
                    <p className="text-sm text-muted-foreground">
                      {rate.monthly_rate.toFixed(2)}% mensal
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
