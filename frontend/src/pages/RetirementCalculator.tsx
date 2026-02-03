import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { formatCompactCurrency } from '@/lib/constants';
import {
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { Calculator, TrendingUp, Target, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RetirementProjection {
  age: number;
  savings: number;
  contributions: number;
  realSavings: number;
}

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyContribution, setMonthlyContribution] = useState(50000);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [inflationRate, setInflationRate] = useState(15);
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(300000);

  const calculations = useMemo(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = expectedReturn / 100 / 12;
    const monthlyInflation = inflationRate / 100 / 12;
    const realMonthlyReturn = (1 + monthlyReturn) / (1 + monthlyInflation) - 1;

    // Future Value with compound interest and monthly contributions
    let futureValue = currentSavings;
    let realFutureValue = currentSavings;
    const projections: RetirementProjection[] = [];
    let totalContributions = currentSavings;

    for (let month = 1; month <= monthsToRetirement; month++) {
      futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
      realFutureValue = realFutureValue * (1 + realMonthlyReturn) + monthlyContribution;
      totalContributions += monthlyContribution;

      if (month % 12 === 0) {
        projections.push({
          age: currentAge + month / 12,
          savings: Math.round(futureValue),
          contributions: totalContributions,
          realSavings: Math.round(realFutureValue),
        });
      }
    }

    // How much is needed for desired income (using 4% rule)
    const annualIncomeNeeded = desiredMonthlyIncome * 12;
    const neededAtRetirement = annualIncomeNeeded / 0.04;

    // Years of income from savings (assuming 4% withdrawal rate)
    const yearsOfIncome = realFutureValue / (desiredMonthlyIncome * 12);

    // Monthly contribution needed to reach goal
    const targetFV = neededAtRetirement;
    let requiredMonthly = 0;
    if (targetFV > currentSavings) {
      // PMT formula: PMT = (FV - PV * (1+r)^n) / (((1+r)^n - 1) / r)
      const compoundFactor = Math.pow(1 + realMonthlyReturn, monthsToRetirement);
      const numerator = targetFV - currentSavings * compoundFactor;
      const denominator = (compoundFactor - 1) / realMonthlyReturn;
      requiredMonthly = numerator / denominator;
    }

    const isOnTrack = realFutureValue >= neededAtRetirement;
    const progressPercent = Math.min(100, (realFutureValue / neededAtRetirement) * 100);

    return {
      futureValue,
      realFutureValue,
      projections,
      totalContributions,
      neededAtRetirement,
      yearsOfIncome,
      requiredMonthly: Math.max(0, requiredMonthly),
      isOnTrack,
      progressPercent,
      yearsToRetirement,
    };
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn, inflationRate, desiredMonthlyIncome]);

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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calculadora de Reforma</h1>
          <p className="text-muted-foreground">Planeie a sua reforma e calcule quanto precisa poupar</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Idade Actual: {currentAge} anos</Label>
              <Slider
                value={[currentAge]}
                onValueChange={([v]) => setCurrentAge(v)}
                min={18}
                max={70}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Idade de Reforma: {retirementAge} anos</Label>
              <Slider
                value={[retirementAge]}
                onValueChange={([v]) => setRetirementAge(v)}
                min={currentAge + 5}
                max={80}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Poupança Actual (AOA)</Label>
              <Input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Contribuição Mensal (AOA)</Label>
              <Input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Retorno Anual Esperado: {expectedReturn}%</Label>
              <Slider
                value={[expectedReturn]}
                onValueChange={([v]) => setExpectedReturn(v)}
                min={1}
                max={20}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label>Taxa de Inflação: {inflationRate}%</Label>
              <Slider
                value={[inflationRate]}
                onValueChange={([v]) => setInflationRate(v)}
                min={1}
                max={30}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label>Rendimento Mensal Desejado na Reforma (AOA)</Label>
              <Input
                type="number"
                value={desiredMonthlyIncome}
                onChange={(e) => setDesiredMonthlyIncome(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Card */}
          <Card className={calculations.isOnTrack ? 'border-green-500/50 bg-green-500/5' : 'border-amber-500/50 bg-amber-500/5'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {calculations.isOnTrack ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-amber-500" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {calculations.isOnTrack ? 'Está no bom caminho!' : 'Precisa aumentar as contribuições'}
                  </h3>
                  <p className="text-muted-foreground">
                    {calculations.isOnTrack 
                      ? `Com o plano actual, terá ${formatCurrency(calculations.realFutureValue)} na reforma.`
                      : `Precisa de mais ${formatCurrency(calculations.neededAtRetirement - calculations.realFutureValue)} para atingir o seu objectivo.`
                    }
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso para a meta</span>
                      <span>{calculations.progressPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={calculations.progressPercent} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="min-w-0">
              <CardContent className="pt-6 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-primary truncate" title={formatCurrency(calculations.realFutureValue)}>
                  {formatCompactCurrency(calculations.realFutureValue)}
                </div>
                <p className="text-sm text-muted-foreground">Valor Real na Reforma</p>
              </CardContent>
            </Card>
            <Card className="min-w-0">
              <CardContent className="pt-6 min-w-0">
                <div className="text-xl sm:text-2xl font-bold truncate" title={formatCurrency(calculations.neededAtRetirement)}>
                  {formatCompactCurrency(calculations.neededAtRetirement)}
                </div>
                <p className="text-sm text-muted-foreground">Meta Necessária (regra 4%)</p>
              </CardContent>
            </Card>
            <Card className="min-w-0">
              <CardContent className="pt-6 min-w-0">
                <div className="text-xl sm:text-2xl font-bold truncate">
                  {calculations.yearsOfIncome.toFixed(1)} anos
                </div>
                <p className="text-sm text-muted-foreground">Duração do Fundo</p>
              </CardContent>
            </Card>
            <Card className="min-w-0">
              <CardContent className="pt-6 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-amber-500 truncate" title={formatCurrency(calculations.requiredMonthly)}>
                  {formatCompactCurrency(calculations.requiredMonthly)}
                </div>
                <p className="text-sm text-muted-foreground">Contribuição Recomendada</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Projecção de Poupança
              </CardTitle>
              <CardDescription>
                Evolução do seu património até à reforma ({calculations.yearsToRetirement} anos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calculations.projections}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="age" 
                      tickFormatter={(v) => `${v}`}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Idade: ${label} anos`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      name="Contribuições"
                      stroke="hsl(var(--muted-foreground))"
                      fill="hsl(var(--muted))"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="realSavings"
                      name="Valor Real (ajustado à inflação)"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      name="Valor Nominal"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas para a Reforma</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Regra dos 4%:</strong> Pode retirar 4% do seu fundo anualmente sem esgotar rapidamente as poupanças.</li>
                <li>• <strong>Comece cedo:</strong> Cada ano de antecipação pode fazer grande diferença devido aos juros compostos.</li>
                <li>• <strong>Diversifique:</strong> Considere diferentes tipos de investimentos para reduzir riscos.</li>
                <li>• <strong>Ajuste pela inflação:</strong> Os valores mostrados já consideram a perda de poder de compra.</li>
                <li>• <strong>Reveja anualmente:</strong> Ajuste o seu plano conforme as circunstâncias mudam.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
