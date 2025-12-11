import { useMemo } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scenario } from '@/hooks/useScenarios';
import { runSimulation, SimulationResult } from '@/lib/simulationEngine';

interface ScenarioComparisonProps {
  scenarios: Scenario[];
  initialWealth: number;
  goals: { name: string; amount: number }[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(199, 89%, 48%)',
];

export function ScenarioComparison({ scenarios, initialWealth, goals }: ScenarioComparisonProps) {
  // Run simulation for each scenario
  const simulationResults = useMemo(() => {
    return scenarios.map(scenario => ({
      scenario,
      result: runSimulation({
        initialWealth,
        monthlyIncome: scenario.monthly_income_estimate,
        monthlyExpense: scenario.monthly_expense_estimate,
        salaryIncreaseRate: scenario.salary_increase_rate,
        investmentReturnRate: scenario.investment_return_rate,
        inflationRate: scenario.inflation_rate,
        timeHorizonYears: scenario.time_horizon_years,
        futureExpenses: scenario.future_expenses || [],
        goals,
      }),
    }));
  }, [scenarios, initialWealth, goals]);

  // Build chart data - combine projections from all scenarios
  const chartData = useMemo(() => {
    if (simulationResults.length === 0) return [];

    // Find the maximum months across all scenarios
    const maxMonths = Math.max(...simulationResults.map(sr => sr.result.projections.length));
    
    // Sample every 6 months for cleaner chart
    const dataPoints: Record<string, unknown>[] = [];
    
    for (let month = 0; month <= maxMonths; month += 6) {
      const point: Record<string, unknown> = { month };
      
      simulationResults.forEach((sr, index) => {
        const projection = sr.result.projections.find(p => p.month === month) || 
                          sr.result.projections[sr.result.projections.length - 1];
        if (projection) {
          point[`scenario_${index}`] = Math.round(projection.wealth);
          if (month === 0 || month % 12 === 0) {
            point.date = format(projection.date, 'MMM yyyy', { locale: pt });
          }
        }
      });
      
      dataPoints.push(point);
    }
    
    return dataPoints;
  }, [simulationResults]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompact = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Património Projetado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  tickFormatter={formatCompact}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => {
                    const index = parseInt(name.split('_')[1]);
                    const scenarioName = simulationResults[index]?.scenario.name || name;
                    return [formatCurrency(value), scenarioName];
                  }}
                />
                <Legend 
                  formatter={(value: string) => {
                    const index = parseInt(value.split('_')[1]);
                    return simulationResults[index]?.scenario.name || value;
                  }}
                />
                
                {simulationResults.map((_, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={`scenario_${index}`}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Comparativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Métrica</TableHead>
                  {simulationResults.map((sr, index) => (
                    <TableHead key={index} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate max-w-[120px]">{sr.scenario.name}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Património Final</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center font-semibold">
                      {formatCurrency(sr.result.finalWealth)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Património Real (ajustado)</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {formatCurrency(sr.result.finalRealWealth)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Poupado</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {formatCurrency(sr.result.totalSaved)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ganhos de Investimento</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center text-green-600">
                      {formatCurrency(sr.result.totalInvestmentGains)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ponto de Ruptura</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {sr.result.breakEvenMonth ? (
                        <Badge variant="destructive">
                          Mês {sr.result.breakEvenMonth}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Nenhum
                        </Badge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Taxa Poupança Recomendada</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {sr.result.recommendedSavingsRate.toFixed(0)}%
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Input Parameters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros dos Cenários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Parâmetro</TableHead>
                  {simulationResults.map((sr, index) => (
                    <TableHead key={index} className="text-center">
                      <span className="truncate max-w-[120px]">{sr.scenario.name}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Rendimento Mensal</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {formatCurrency(sr.scenario.monthly_income_estimate)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Despesas Mensais</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {formatCurrency(sr.scenario.monthly_expense_estimate)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Aumento Salarial (%/ano)</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {sr.scenario.salary_increase_rate}%
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Retorno Investimentos (%/ano)</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {sr.scenario.investment_return_rate}%
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Inflação (%/ano)</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {sr.scenario.inflation_rate}%
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Horizonte (anos)</TableCell>
                  {simulationResults.map((sr, index) => (
                    <TableCell key={index} className="text-center">
                      {sr.scenario.time_horizon_years}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
