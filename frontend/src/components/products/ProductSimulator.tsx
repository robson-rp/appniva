import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FinancialProduct, simulateReturn } from '@/hooks/useFinancialProducts';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';

interface ProductSimulatorProps {
  product: FinancialProduct;
  onRequest?: (amount: number, termDays: number) => void;
  onClose?: () => void;
}

export function ProductSimulator({ product, onRequest, onClose }: ProductSimulatorProps) {
  const [amount, setAmount] = useState(product.min_amount);
  const [termDays, setTermDays] = useState(product.term_min_days || 365);

  const rate = product.interest_rate_annual || 0;
  const simulation = simulateReturn(amount, rate, termDays);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: product.currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTerm = (days: number) => {
    const months = Math.floor(days / 30);
    if (months >= 1) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    return `${days} dias`;
  };

  const minTerm = product.term_min_days || 30;
  const maxTerm = product.term_max_days || 730;
  const minAmount = product.min_amount;
  const maxAmount = product.max_amount || product.min_amount * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador - {product.name}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Montante: {formatCurrency(amount)}</Label>
            <Slider
              value={[amount]}
              onValueChange={([v]) => setAmount(v)}
              min={minAmount}
              max={maxAmount}
              step={10000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(minAmount)}</span>
              <span>{formatCurrency(maxAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo: {formatTerm(termDays)}</Label>
            <Slider
              value={[termDays]}
              onValueChange={([v]) => setTermDays(v)}
              min={minTerm}
              max={maxTerm}
              step={30}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTerm(minTerm)}</span>
              <span>{formatTerm(maxTerm)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Capital Investido</span>
            <span className="font-semibold">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Taxa de Juro Anual</span>
            <span className="font-semibold">{rate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Juros Brutos</span>
            <span className="font-semibold text-emerald-600">
              +{formatCurrency(simulation.grossReturn)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">IRT (10%)</span>
            <span className="text-red-500">
              -{formatCurrency(simulation.grossReturn - simulation.netReturn)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-muted-foreground">Juros Líquidos</span>
            <span className="font-bold text-emerald-600">
              +{formatCurrency(simulation.netReturn)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Total a Receber</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(simulation.totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>
            Rendimento líquido de {((simulation.netReturn / amount) * 100).toFixed(2)}% em {formatTerm(termDays)}
          </span>
        </div>

        {onRequest && (
          <Button className="w-full" onClick={() => onRequest(amount, termDays)}>
            Solicitar Este Produto
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
