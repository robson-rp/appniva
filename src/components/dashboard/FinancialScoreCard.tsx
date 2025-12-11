import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  TrendingUp,
  PiggyBank,
  CreditCard,
  BarChart3,
  Globe,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useLatestFinancialScore,
  useGenerateFinancialScore,
} from '@/hooks/useFinancialScore';
import { cn } from '@/lib/utils';

const criteriaIcons: Record<string, React.ElementType> = {
  Disciplina: TrendingUp,
  'Taxa de Poupança': PiggyBank,
  'Saúde das Dívidas': CreditCard,
  'Diversificação de Investimentos': BarChart3,
  'Exposição Cambial': Globe,
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-emerald-600';
  if (score >= 60) return 'from-amber-500 to-amber-600';
  if (score >= 40) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Excelente';
  if (score >= 80) return 'Muito Bom';
  if (score >= 70) return 'Bom';
  if (score >= 60) return 'Razoável';
  if (score >= 50) return 'Regular';
  if (score >= 40) return 'Precisa Atenção';
  return 'Crítico';
};

export function FinancialScoreCard() {
  const { data: score, isLoading } = useLatestFinancialScore();
  const generateScore = useGenerateFinancialScore();
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Score Financeiro</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => generateScore.mutate()}
          disabled={generateScore.isPending}
        >
          <RefreshCw
            className={cn('h-4 w-4', generateScore.isPending && 'animate-spin')}
          />
          <span className="ml-2 hidden sm:inline">
            {generateScore.isPending ? 'Calculando...' : 'Atualizar'}
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        {!score ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Ainda não calculou o seu score financeiro
            </p>
            <Button onClick={() => generateScore.mutate()} disabled={generateScore.isPending}>
              {generateScore.isPending ? 'Calculando...' : 'Calcular Score'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Score */}
            <div className="flex items-center gap-6">
              <div
                className={cn(
                  'relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br',
                  getScoreGradient(score.score)
                )}
              >
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-background">
                  <span className={cn('text-3xl font-bold', getScoreColor(score.score))}>
                    {score.score}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="flex-1">
                <p className={cn('text-xl font-semibold', getScoreColor(score.score))}>
                  {getScoreLabel(score.score)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Calculado em{' '}
                  {format(new Date(score.generated_at), "dd 'de' MMMM 'às' HH:mm", {
                    locale: pt,
                  })}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 mt-2"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
                </Button>
              </div>
            </div>

            {/* Criteria Details */}
            {showDetails && score.criteria_json?.criteria && (
              <div className="space-y-4 pt-4 border-t">
                <TooltipProvider>
                  {score.criteria_json.criteria.map((criterion) => {
                    const Icon = criteriaIcons[criterion.name] || BarChart3;
                    return (
                      <div key={criterion.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{criterion.name}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{criterion.details}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Peso: {criterion.weight}%
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span
                            className={cn('text-sm font-semibold', getScoreColor(criterion.score))}
                          >
                            {criterion.score}/100
                          </span>
                        </div>
                        <Progress
                          value={criterion.score}
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </TooltipProvider>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
