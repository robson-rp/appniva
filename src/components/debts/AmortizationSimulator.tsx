import { useState, useMemo } from 'react';
import { Calculator, TrendingDown, Clock, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Debt } from '@/hooks/useDebts';

interface AmortizationSimulatorProps {
  debts: Debt[];
}

interface SimulationResult {
  originalTotalPayment: number;
  originalMonths: number;
  newTotalPayment: number;
  newMonths: number;
  interestSaved: number;
  timeSavedMonths: number;
}

export function AmortizationSimulator({ debts }: AmortizationSimulatorProps) {
  const activeDebts = debts.filter(d => d.status === 'active');
  const [selectedDebtId, setSelectedDebtId] = useState<string>(activeDebts[0]?.id || '');
  const [extraPayment, setExtraPayment] = useState<number>(0);

  const selectedDebt = activeDebts.find(d => d.id === selectedDebtId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate amortization simulation
  const simulation = useMemo((): SimulationResult | null => {
    if (!selectedDebt || extraPayment <= 0) return null;

    const principal = selectedDebt.current_balance;
    const annualRate = selectedDebt.interest_rate_annual / 100;
    const monthlyRate = annualRate / 12;
    const monthlyPayment = selectedDebt.installment_amount;

    // Calculate original payoff (without extra payment)
    let originalBalance = principal;
    let originalMonths = 0;
    let originalTotalInterest = 0;
    
    while (originalBalance > 0 && originalMonths < 600) { // Max 50 years
      const interestCharge = originalBalance * monthlyRate;
      originalTotalInterest += interestCharge;
      const principalPayment = Math.min(monthlyPayment - interestCharge, originalBalance);
      
      if (principalPayment <= 0) {
        // Payment doesn't cover interest - debt will never be paid
        originalMonths = -1;
        break;
      }
      
      originalBalance -= principalPayment;
      originalMonths++;
    }

    const originalTotalPayment = principal + originalTotalInterest;

    // Calculate new payoff (with extra payment applied immediately)
    const newPrincipal = Math.max(0, principal - extraPayment);
    let newBalance = newPrincipal;
    let newMonths = 0;
    let newTotalInterest = 0;

    while (newBalance > 0 && newMonths < 600) {
      const interestCharge = newBalance * monthlyRate;
      newTotalInterest += interestCharge;
      const principalPayment = Math.min(monthlyPayment - interestCharge, newBalance);
      
      if (principalPayment <= 0) {
        newMonths = -1;
        break;
      }
      
      newBalance -= principalPayment;
      newMonths++;
    }

    const newTotalPayment = newPrincipal + newTotalInterest + extraPayment;
    const interestSaved = originalTotalInterest - newTotalInterest;
    const timeSavedMonths = originalMonths - newMonths;

    return {
      originalTotalPayment,
      originalMonths,
      newTotalPayment,
      newMonths,
      interestSaved: Math.max(0, interestSaved),
      timeSavedMonths: Math.max(0, timeSavedMonths),
    };
  }, [selectedDebt, extraPayment]);

  if (activeDebts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulador de Amortização Antecipada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="debt-select">Selecionar Dívida</Label>
            <Select value={selectedDebtId} onValueChange={setSelectedDebtId}>
              <SelectTrigger id="debt-select">
                <SelectValue placeholder="Escolha uma dívida" />
              </SelectTrigger>
              <SelectContent>
                {activeDebts.map((debt) => (
                  <SelectItem key={debt.id} value={debt.id}>
                    {debt.name} ({formatCurrency(debt.current_balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-payment">Pagamento Extra (Kz)</Label>
            <Input
              id="extra-payment"
              type="number"
              min={0}
              max={selectedDebt?.current_balance || 0}
              value={extraPayment || ''}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              placeholder="Ex: 100000"
            />
          </div>
        </div>

        {/* Debt Info */}
        {selectedDebt && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Saldo Atual:</span>
                <span className="ml-2 font-medium">{formatCurrency(selectedDebt.current_balance)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa Anual:</span>
                <span className="ml-2 font-medium">{selectedDebt.interest_rate_annual}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Prestação:</span>
                <span className="ml-2 font-medium">{formatCurrency(selectedDebt.installment_amount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {simulation && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <PiggyBank className="h-4 w-4" />
                  <span className="text-sm font-medium">Economia de Juros</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(simulation.interestSaved)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {simulation.originalTotalPayment > 0 
                    ? `${((simulation.interestSaved / simulation.originalTotalPayment) * 100).toFixed(1)}% do total`
                    : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-accent-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Tempo Economizado</span>
                </div>
                <div className="text-2xl font-bold">
                  {simulation.timeSavedMonths} {simulation.timeSavedMonths === 1 ? 'mês' : 'meses'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  De {simulation.originalMonths} para {simulation.newMonths} meses
                </p>
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Novo Total</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(simulation.newTotalPayment)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Antes: {formatCurrency(simulation.originalTotalPayment)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!simulation && extraPayment <= 0 && selectedDebt && (
          <div className="text-center py-6 text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Insira um valor de pagamento extra para ver a simulação</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
