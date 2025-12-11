import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  PiggyBank,
  Calendar,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SimulationResult } from '@/lib/simulationEngine';

interface SimulationResultsProps {
  result: SimulationResult;
}

export function SimulationResults({ result }: SimulationResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Património Final</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(result.finalWealth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Real: {formatCurrency(result.finalRealWealth)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Poupado</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(result.totalSaved)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ao longo do período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Investimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(result.totalInvestmentGains)}
            </div>
            <p className="text-xs text-muted-foreground">
              Juros compostos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Poupança Recomendada</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.recommendedSavingsRate.toFixed(0)}%
            </div>
            <Progress value={result.recommendedSavingsRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Break Even Warning */}
      {result.breakEvenMonth && result.breakEvenDate && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">Ponto de Ruptura Detectado</h3>
              <p className="text-sm text-muted-foreground">
                Cashflow negativo previsto no mês {result.breakEvenMonth} ({format(result.breakEvenDate, 'MMMM yyyy', { locale: pt })}).
                Considere reduzir despesas ou aumentar rendimentos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Projections */}
      {result.goalProjections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Projeção de Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.goalProjections.map((gp, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{gp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Meta: {formatCurrency(gp.targetAmount)}
                    </p>
                  </div>
                  {gp.reachedMonth && gp.reachedDate ? (
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(gp.reachedDate, 'MMM yyyy', { locale: pt })}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Em {gp.reachedMonth} meses
                      </p>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Não atingida no período
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
