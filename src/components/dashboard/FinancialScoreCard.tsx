import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  PiggyBank,
  CreditCard,
  FolderKanban,
  Target,
  RefreshCw,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  'Disciplina de Despesas': TrendingUp,
  'Taxa de Poupança': PiggyBank,
  'Nível de Endividamento': CreditCard,
  'Organização Financeira': FolderKanban,
  'Planeamento Futuro': Target,
  Disciplina: TrendingUp,
  'Saúde das Dívidas': CreditCard,
  'Diversificação de Investimentos': FolderKanban,
  'Exposição Cambial': Target,
};

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
};

const getScoreGradient = (score: number) => {
  if (score >= 70) return 'from-emerald-500 to-emerald-600';
  if (score >= 50) return 'from-amber-500 to-amber-600';
  return 'from-red-500 to-red-600';
};

const getScoreLabel = (score: number) => {
  if (score >= 70) return { label: 'Saudável', emoji: '🟢' };
  if (score >= 50) return { label: 'Em Melhoria', emoji: '🟡' };
  return { label: 'Frágil', emoji: '🔴' };
};

export function FinancialScoreCard() {
  const { data: score, isLoading } = useLatestFinancialScore();
  const generateScore = useGenerateFinancialScore();
  const [showDetails, setShowDetails] = useState(false);
  const status = score ? getScoreLabel(score.score) : null;

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
        <CardTitle className="text-lg font-medium">Saúde Financeira</CardTitle>
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
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
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
                <Badge className={cn('mb-2', getScoreColor(score.score))}>
                  {status?.emoji} {status?.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Calculado em{' '}
                  {format(new Date(score.generated_at), "dd 'de' MMMM 'às' HH:mm", {
                    locale: pt,
                  })}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
                  </Button>
                  <Button variant="link" size="sm" className="px-0" asChild>
                    <Link to="/score">
                      Ver análise completa
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Criteria Details */}
            {showDetails && score.criteria_json?.criteria && (
              <div className="space-y-4 pt-4 border-t">
                <TooltipProvider>
                  {score.criteria_json.criteria.map((criterion) => {
                    const Icon = criteriaIcons[criterion.name] || TrendingUp;
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
