import { Clock, TrendingUp, CheckCircle2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Kixikila, KixikilaContribution, KixikilaMember } from '@/hooks/useKixikilas';
import { formatCurrency } from '@/lib/constants';
import { differenceInDays, addDays, addWeeks, format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface KixikilaStatsProps {
  kixikila: Kixikila;
  members: KixikilaMember[];
  contributions: KixikilaContribution[];
}

export function KixikilaStats({ kixikila, members, contributions }: KixikilaStatsProps) {
  // Calculate next payment date based on frequency
  const getNextPaymentDate = () => {
    const startDate = new Date(kixikila.start_date);
    const roundsCompleted = kixikila.current_round - 1;
    
    switch (kixikila.frequency) {
      case 'weekly':
        return addWeeks(startDate, roundsCompleted);
      case 'biweekly':
        return addWeeks(startDate, roundsCompleted * 2);
      case 'monthly':
      default:
        const nextDate = new Date(startDate);
        nextDate.setMonth(nextDate.getMonth() + roundsCompleted);
        return nextDate;
    }
  };

  const nextPaymentDate = getNextPaymentDate();
  const daysUntilPayment = differenceInDays(nextPaymentDate, new Date());

  // Calculate compliance rate
  const expectedContributions = (kixikila.current_round - 1) * kixikila.total_members + 
    contributions.filter(c => c.round_number === kixikila.current_round).length;
  const actualContributions = contributions.length;
  const complianceRate = expectedContributions > 0 
    ? Math.round((actualContributions / expectedContributions) * 100) 
    : 100;

  // Calculate total received per member
  const completedRounds = kixikila.current_round - 1;
  const amountPerRecipient = kixikila.contribution_amount * (kixikila.total_members - 1);

  // Get current round contributions
  const currentRoundContributions = contributions.filter(c => c.round_number === kixikila.current_round);
  const paidCount = currentRoundContributions.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Próximo Pagamento</span>
          </div>
          {daysUntilPayment < 0 ? (
            <p className="text-lg font-bold text-destructive">Atrasado</p>
          ) : daysUntilPayment === 0 ? (
            <p className="text-lg font-bold text-chart-2">Hoje</p>
          ) : (
            <p className="text-lg font-bold">{daysUntilPayment} dias</p>
          )}
          <p className="text-xs text-muted-foreground">
            {format(nextPaymentDate, "d 'de' MMM", { locale: pt })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Taxa Cumprimento</span>
          </div>
          <p className={`text-lg font-bold ${complianceRate >= 80 ? 'text-green-500' : complianceRate >= 50 ? 'text-yellow-500' : 'text-destructive'}`}>
            {complianceRate}%
          </p>
          <p className="text-xs text-muted-foreground">
            {actualContributions} de {expectedContributions} pagamentos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Valor por Rodada</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(amountPerRecipient, kixikila.currency)}</p>
          <p className="text-xs text-muted-foreground">
            Cada membro recebe
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Rodada Atual</span>
          </div>
          <p className="text-lg font-bold">{paidCount}/{kixikila.total_members}</p>
          <p className="text-xs text-muted-foreground">
            Membros pagaram
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
