import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Briefcase,
  Target,
  Users, 
  Home,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useHistoricalStats } from '@/hooks/useHistoricalStats';
import { useAccounts } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';

type JobStability = 'stable' | 'moderate' | 'unstable';
type IncomeSource = 'single' | 'dual' | 'multiple';

export default function EmergencyFundCalculator() {
  const { data: historicalStats } = useHistoricalStats(6);
  const { data: accounts } = useAccounts();

  const [monthlyExpenses, setMonthlyExpenses] = useState(historicalStats?.averageMonthlyExpense || 200000);
  const [currentFund, setCurrentFund] = useState(0);
  const [jobStability, setJobStability] = useState<JobStability>('moderate');
  const [incomeSource, setIncomeSource] = useState<IncomeSource>('single');
  const [dependents, setDependents] = useState(0);
  const [hasHealthIssues, setHasHealthIssues] = useState(false);
  const [monthlySavings, setMonthlySavings] = useState(50000);

  // Calculate total liquid assets from accounts
  const totalLiquidAssets = useMemo(() => {
    if (!accounts) return 0;
    return accounts
      .filter(a => a.is_active && ['bank', 'wallet', 'cash'].includes(a.account_type))
      .reduce((sum, a) => sum + a.current_balance, 0);
  }, [accounts]);

  const calculations = useMemo(() => {
    // Base months needed (3-6 months)
    let baseMonths = 3;

    // Adjust based on job stability
    if (jobStability === 'moderate') baseMonths += 1;
    if (jobStability === 'unstable') baseMonths += 3;

    // Adjust based on income sources
    if (incomeSource === 'single') baseMonths += 1;
    if (incomeSource === 'multiple') baseMonths -= 1;

    // Adjust based on dependents
    baseMonths += Math.min(dependents, 3);

    // Adjust for health issues
    if (hasHealthIssues) baseMonths += 1;

    // Ensure between 3 and 12 months
    const recommendedMonths = Math.max(3, Math.min(12, baseMonths));
    
    const targetFund = monthlyExpenses * recommendedMonths;
    const effectiveFund = currentFund || totalLiquidAssets;
    const deficit = Math.max(0, targetFund - effectiveFund);
    const progressPercent = targetFund > 0 ? Math.min(100, (effectiveFund / targetFund) * 100) : 0;
    const monthsToGoal = monthlySavings > 0 ? Math.ceil(deficit / monthlySavings) : Infinity;

    // Status determination
    let status: 'critical' | 'warning' | 'good' | 'excellent';
    if (progressPercent < 25) status = 'critical';
    else if (progressPercent < 50) status = 'warning';
    else if (progressPercent < 100) status = 'good';
    else status = 'excellent';

    return {
      recommendedMonths,
      targetFund,
      effectiveFund,
      deficit,
      progressPercent,
      monthsToGoal,
      status,
    };
  }, [monthlyExpenses, currentFund, totalLiquidAssets, jobStability, incomeSource, dependents, hasHealthIssues, monthlySavings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = () => {
    switch (calculations.status) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/50';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/50';
      case 'good': return 'text-blue-500 bg-blue-500/10 border-blue-500/50';
      case 'excellent': return 'text-green-500 bg-green-500/10 border-green-500/50';
    }
  };

  const getStatusIcon = () => {
    switch (calculations.status) {
      case 'critical':
      case 'warning':
        return <AlertTriangle className="h-12 w-12" />;
      case 'good':
      case 'excellent':
        return <CheckCircle2 className="h-12 w-12" />;
    }
  };

  const getStatusMessage = () => {
    switch (calculations.status) {
      case 'critical':
        return 'Fundo de emergência crítico! Priorize aumentar as suas reservas.';
      case 'warning':
        return 'Fundo de emergência insuficiente. Continue a poupar regularmente.';
      case 'good':
        return 'Bom progresso! Continue até atingir a meta recomendada.';
      case 'excellent':
        return 'Parabéns! O seu fundo de emergência está completo.';
    }
  };

  const handleUseHistoricalData = () => {
    if (historicalStats?.averageMonthlyExpense) {
      setMonthlyExpenses(Math.round(historicalStats.averageMonthlyExpense));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calculadora de Fundo de Emergência</h1>
          <p className="text-muted-foreground">Descubra quanto precisa para estar financeiramente seguro</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dados Financeiros</CardTitle>
            <CardDescription>Insira os seus dados para cálculo personalizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {historicalStats && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Despesas médias detectadas (últimos {historicalStats.monthsAnalyzed} meses):
                </p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(historicalStats.averageMonthlyExpense)}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleUseHistoricalData}
                >
                  Usar este valor
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Despesas Mensais (AOA)</Label>
              <Input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Fundo de Emergência Actual (AOA)</Label>
              <Input
                type="number"
                value={currentFund}
                onChange={(e) => setCurrentFund(Number(e.target.value))}
                placeholder={`Ou usar saldo das contas: ${formatCurrency(totalLiquidAssets)}`}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em 0 para usar o saldo das suas contas ({formatCurrency(totalLiquidAssets)})
              </p>
            </div>

            <div className="space-y-2">
              <Label>Poupança Mensal Disponível (AOA)</Label>
              <Input
                type="number"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Number(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Estabilidade no Emprego
              </Label>
              <RadioGroup value={jobStability} onValueChange={(v) => setJobStability(v as JobStability)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stable" id="stable" />
                  <Label htmlFor="stable" className="font-normal">Estável (funcionário público, contrato efectivo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate" className="font-normal">Moderado (contrato a prazo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unstable" id="unstable" />
                  <Label htmlFor="unstable" className="font-normal">Instável (freelancer, negócio próprio)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Fontes de Rendimento
              </Label>
              <RadioGroup value={incomeSource} onValueChange={(v) => setIncomeSource(v as IncomeSource)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal">Única fonte de rendimento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dual" id="dual" />
                  <Label htmlFor="dual" className="font-normal">Duas fontes (casal)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple" id="multiple" />
                  <Label htmlFor="multiple" className="font-normal">Múltiplas fontes</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Número de Dependentes: {dependents}
              </Label>
              <Slider
                value={[dependents]}
                onValueChange={([v]) => setDependents(v)}
                min={0}
                max={6}
                step={1}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="health"
                checked={hasHealthIssues}
                onChange={(e) => setHasHealthIssues(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="health" className="font-normal">
                Condições de saúde que requerem despesas regulares
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Card */}
          <Card className={getStatusColor()}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{getStatusMessage()}</h3>
                  <p className="text-muted-foreground mt-1">
                    Recomendamos {calculations.recommendedMonths} meses de despesas como fundo de emergência.
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{calculations.progressPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={calculations.progressPercent} className="h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(calculations.targetFund)}
                    </div>
                    <p className="text-sm text-muted-foreground">Meta Recomendada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-chart-2" />
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(calculations.effectiveFund)}
                    </div>
                    <p className="text-sm text-muted-foreground">Fundo Actual</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {calculations.monthsToGoal === Infinity ? '∞' : `${calculations.monthsToGoal} meses`}
                    </div>
                    <p className="text-sm text-muted-foreground">Tempo até Meta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {calculations.deficit > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <div>
                    <h4 className="font-semibold">Défice Actual</h4>
                    <p className="text-2xl font-bold text-amber-500">
                      {formatCurrency(calculations.deficit)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Poupando {formatCurrency(monthlySavings)} por mês, atingirá a meta em {calculations.monthsToGoal} meses.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Months breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Composição da Recomendação</CardTitle>
              <CardDescription>Como chegámos a {calculations.recommendedMonths} meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span>Base mínima</span>
                  <span className="font-medium">3 meses</span>
                </div>
                {jobStability !== 'stable' && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Ajuste por estabilidade ({jobStability === 'moderate' ? 'moderada' : 'instável'})</span>
                    <span className="font-medium text-amber-500">+{jobStability === 'moderate' ? 1 : 3} {jobStability === 'moderate' ? 'mês' : 'meses'}</span>
                  </div>
                )}
                {incomeSource === 'single' && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Ajuste por fonte única de rendimento</span>
                    <span className="font-medium text-amber-500">+1 mês</span>
                  </div>
                )}
                {incomeSource === 'multiple' && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Bónus por múltiplas fontes</span>
                    <span className="font-medium text-green-500">-1 mês</span>
                  </div>
                )}
                {dependents > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Ajuste por {dependents} dependente{dependents > 1 ? 's' : ''}</span>
                    <span className="font-medium text-amber-500">+{Math.min(dependents, 3)} {Math.min(dependents, 3) === 1 ? 'mês' : 'meses'}</span>
                  </div>
                )}
                {hasHealthIssues && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Ajuste por condições de saúde</span>
                    <span className="font-medium text-amber-500">+1 mês</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 font-semibold text-lg">
                  <span>Total Recomendado</span>
                  <span className="text-primary">{calculations.recommendedMonths} meses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas para o Fundo de Emergência</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Mantenha líquido:</strong> O fundo deve estar em conta de fácil acesso, não em investimentos de longo prazo.</li>
                <li>• <strong>Separe do resto:</strong> Considere uma conta separada só para emergências.</li>
                <li>• <strong>Automatize:</strong> Configure transferências automáticas mensais para o fundo.</li>
                <li>• <strong>Use apenas para emergências:</strong> Desemprego, doença ou reparações urgentes, não para desejos.</li>
                <li>• <strong>Recalcule anualmente:</strong> As suas despesas e circunstâncias podem mudar.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
