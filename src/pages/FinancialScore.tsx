import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  PiggyBank,
  CreditCard,
  FolderKanban,
  Target,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  ArrowUp,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  useFinancialScoreHistory,
  useGenerateFinancialScore,
} from '@/hooks/useFinancialScore';
import { cn } from '@/lib/utils';

const criteriaIcons: Record<string, React.ElementType> = {
  'Disciplina de Despesas': TrendingUp,
  'Taxa de Poupança': PiggyBank,
  'Nível de Endividamento': CreditCard,
  'Organização Financeira': FolderKanban,
  'Planeamento Futuro': Target,
  // Legacy names for backwards compatibility
  Disciplina: TrendingUp,
  'Saúde das Dívidas': CreditCard,
  'Diversificação de Investimentos': FolderKanban,
  'Exposição Cambial': Target,
};

const getScoreStatus = (score: number) => {
  if (score >= 70) return { label: 'Saudável', color: 'text-emerald-500', bg: 'bg-emerald-500/10', emoji: '🟢' };
  if (score >= 50) return { label: 'Em Melhoria', color: 'text-amber-500', bg: 'bg-amber-500/10', emoji: '🟡' };
  return { label: 'Frágil', color: 'text-red-500', bg: 'bg-red-500/10', emoji: '🔴' };
};

const getScoreGradient = (score: number) => {
  if (score >= 70) return 'from-emerald-500 to-emerald-600';
  if (score >= 50) return 'from-amber-500 to-amber-600';
  return 'from-red-500 to-red-600';
};

const getCriteriaColor = (score: number) => {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

// Tips based on score criteria
const getTips = (criteria: any[]) => {
  const tips: { message: string; impact: string }[] = [];
  
  criteria?.forEach((c) => {
    if (c.score < 60) {
      if (c.name.includes('Poupança')) {
        tips.push({
          message: 'Aumenta a tua taxa de poupança para pelo menos 20% do rendimento.',
          impact: '+8 pontos',
        });
      }
      if (c.name.includes('Endividamento') || c.name.includes('Dívidas')) {
        tips.push({
          message: 'Reduz as prestações mensais para menos de 30% do rendimento.',
          impact: '+10 pontos',
        });
      }
      if (c.name.includes('Disciplina')) {
        tips.push({
          message: 'Mantém despesas mais consistentes mês a mês.',
          impact: '+5 pontos',
        });
      }
      if (c.name.includes('Organização')) {
        tips.push({
          message: 'Cria orçamentos para as principais categorias de despesas.',
          impact: '+6 pontos',
        });
      }
      if (c.name.includes('Planeamento') || c.name.includes('Futuro')) {
        tips.push({
          message: 'Define metas financeiras com prazos específicos.',
          impact: '+7 pontos',
        });
      }
    }
  });
  
  return tips.slice(0, 3);
};

export default function FinancialScore() {
  const { t } = useTranslation();
  const { data: score, isLoading } = useLatestFinancialScore();
  const { data: history } = useFinancialScoreHistory(5);
  const generateScore = useGenerateFinancialScore();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const status = score ? getScoreStatus(score.score) : null;
  const tips = score?.criteria_json?.criteria ? getTips(score.criteria_json.criteria) : [];
  const lowestCriteria = score?.criteria_json?.criteria?.reduce((min, c) => 
    c.score < min.score ? c : min
  , score?.criteria_json?.criteria[0]);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saúde Financeira</h1>
          <p className="text-muted-foreground">Avalia e melhora a tua situação financeira</p>
        </div>
        <Button
          onClick={() => generateScore.mutate()}
          disabled={generateScore.isPending}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', generateScore.isPending && 'animate-spin')} />
          {generateScore.isPending ? 'Calculando...' : 'Recalcular'}
        </Button>
      </div>

      {!score ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Calcula o teu Score</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Analisa as tuas finanças e recebe um score de 0 a 100 com recomendações personalizadas.
            </p>
            <Button size="lg" onClick={() => generateScore.mutate()} disabled={generateScore.isPending}>
              {generateScore.isPending ? 'Calculando...' : 'Calcular Agora'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Score Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Score Atual</CardTitle>
              <CardDescription>
                Calculado em {format(new Date(score.generated_at), "dd/MM 'às' HH:mm", { locale: pt })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <div className={cn(
                'relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br mb-4',
                getScoreGradient(score.score)
              )}>
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-background">
                  <span className={cn('text-5xl font-bold', status?.color)}>
                    {score.score}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
              
              <Badge className={cn('text-lg px-4 py-1', status?.bg, status?.color)}>
                {status?.emoji} {status?.label}
              </Badge>
              
              {lowestCriteria && lowestCriteria.score < 60 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  O teu score é penalizado por: <strong>{lowestCriteria.name.toLowerCase()}</strong>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Criteria Breakdown */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Breakdown por Critério</CardTitle>
              <CardDescription>Detalhes de cada componente do score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <TooltipProvider>
                {score.criteria_json?.criteria?.map((criterion) => {
                  const Icon = criteriaIcons[criterion.name] || TrendingUp;
                  const criteriaStatus = getScoreStatus(criterion.score);
                  
                  return (
                    <div key={criterion.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-md', criteriaStatus.bg)}>
                            <Icon className={cn('h-4 w-4', criteriaStatus.color)} />
                          </div>
                          <span className="font-medium">{criterion.name}</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{criterion.details}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Peso: {criterion.weight}%
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {criterion.weight}%
                          </span>
                          <span className={cn('font-semibold', criteriaStatus.color)}>
                            {criterion.score}/100
                          </span>
                        </div>
                      </div>
                      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', getCriteriaColor(criterion.score))}
                          style={{ width: `${criterion.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Tips Card */}
          {tips.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Como Melhorar</CardTitle>
                </div>
                <CardDescription>Sugestões para aumentar o teu score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <ArrowUp className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{tip.message}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {tip.impact}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* History Card */}
          {history && history.length > 1 && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Histórico</CardTitle>
                <CardDescription>Últimas avaliações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.slice(0, 5).map((h, i) => {
                  const hStatus = getScoreStatus(h.score);
                  const prevScore = history[i + 1]?.score;
                  const diff = prevScore ? h.score - prevScore : 0;
                  
                  return (
                    <div key={h.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className={cn('font-semibold', hStatus.color)}>
                          {h.score}/100
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(h.generated_at), 'dd/MM/yyyy', { locale: pt })}
                        </p>
                      </div>
                      {diff !== 0 && (
                        <Badge variant={diff > 0 ? 'default' : 'destructive'} className="text-xs">
                          {diff > 0 ? '+' : ''}{diff}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Link to Insights */}
          <Card className="lg:col-span-3 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Insights Personalizados</h3>
                    <p className="text-sm text-muted-foreground">
                      Recebe sugestões baseadas em IA para melhorar as tuas finanças
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/insights">
                    Ver Insights
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
