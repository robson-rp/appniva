import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Building2, Calendar, TrendingUp, Percent, Clock, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/constants';
import { differenceInDays, isPast, isFuture } from 'date-fns';

interface TermDeposit {
  interest_rate_annual: number;
  term_days: number;
  interest_payment_frequency: string;
  tax_rate: number | null;
  auto_renew: boolean;
}

interface BondOTNR {
  coupon_rate_annual: number;
  coupon_frequency: string;
  quantity: number;
  face_value_per_unit: number;
  isin: string | null;
  custodian_institution: string | null;
}

interface Investment {
  id: string;
  name: string;
  investment_type: string;
  principal_amount: number;
  start_date: string;
  maturity_date: string | null;
  currency: string;
  institution_name: string | null;
  notes: string | null;
  term_deposit: TermDeposit[] | null;
  bond_otnr: BondOTNR[] | null;
}

interface InvestmentCardProps {
  investment: Investment;
  onDelete: () => void;
}

function calculateTermDepositInterest(
  principal: number,
  annualRate: number,
  termDays: number,
  taxRate: number = 0
): { gross: number; net: number; effectiveRate: number } {
  const gross = principal * (annualRate / 100) * (termDays / 365);
  const tax = gross * (taxRate / 100);
  const net = gross - tax;
  const effectiveRate = (net / principal) * (365 / termDays) * 100;
  return { gross, net, effectiveRate };
}

function calculateBondAnnualCoupon(
  quantity: number,
  faceValue: number,
  couponRate: number
): number {
  return quantity * faceValue * (couponRate / 100);
}

function getFrequencyLabel(freq: string): string {
  const labels: Record<string, string> = {
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    semiannual: 'Semestral',
    annual: 'Anual',
    at_maturity: 'No Vencimento',
  };
  return labels[freq] || freq;
}

function getInvestmentStatus(startDate: string, maturityDate: string | null): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  const start = new Date(startDate);
  const maturity = maturityDate ? new Date(maturityDate) : null;
  const today = new Date();

  if (isFuture(start)) {
    return { label: 'Pendente', variant: 'secondary' };
  }
  if (maturity && isPast(maturity)) {
    return { label: 'Vencido', variant: 'destructive' };
  }
  return { label: 'Activo', variant: 'default' };
}

export function InvestmentCard({ investment, onDelete }: InvestmentCardProps) {
  const td = investment.term_deposit?.[0];
  const bond = investment.bond_otnr?.[0];
  const isTermDeposit = investment.investment_type === 'term_deposit';
  
  const status = getInvestmentStatus(investment.start_date, investment.maturity_date);
  
  // Calculate days remaining
  const daysRemaining = investment.maturity_date
    ? differenceInDays(new Date(investment.maturity_date), new Date())
    : null;

  // Calculate interest
  let interestInfo: { gross: number; net: number; rate: number } | null = null;
  let annualCoupon: number | null = null;

  if (isTermDeposit && td) {
    const calc = calculateTermDepositInterest(
      Number(investment.principal_amount),
      Number(td.interest_rate_annual),
      td.term_days,
      Number(td.tax_rate) || 0
    );
    interestInfo = { gross: calc.gross, net: calc.net, rate: calc.effectiveRate };
  } else if (bond) {
    annualCoupon = calculateBondAnnualCoupon(
      bond.quantity,
      Number(bond.face_value_per_unit),
      Number(bond.coupon_rate_annual)
    );
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{investment.name}</CardTitle>
            {investment.institution_name && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {investment.institution_name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Principal Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Capital Investido</span>
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(Number(investment.principal_amount), investment.currency)}
          </span>
        </div>

        {/* Type-specific details */}
        {isTermDeposit && td && (
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Taxa:</span>
                <span className="font-medium">{td.interest_rate_annual}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Prazo:</span>
                <span className="font-medium">{td.term_days} dias</span>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Pagamento: </span>
              <span className="font-medium">{getFrequencyLabel(td.interest_payment_frequency)}</span>
            </div>

            {td.auto_renew && (
              <div className="flex items-center gap-1 text-sm text-primary">
                <RefreshCw className="h-3.5 w-3.5" />
                Renovação automática
              </div>
            )}

            {interestInfo && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Juros Brutos</span>
                  <span>{formatCurrency(interestInfo.gross, investment.currency)}</span>
                </div>
                {td.tax_rate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Imposto ({td.tax_rate}%)</span>
                    <span className="text-destructive">
                      -{formatCurrency(interestInfo.gross - interestInfo.net, investment.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Juros Líquidos</span>
                  <span className="text-income">{formatCurrency(interestInfo.net, investment.currency)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Taxa Efectiva Líquida</span>
                  <span>{interestInfo.rate.toFixed(2)}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!isTermDeposit && bond && (
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Cupão:</span>
                <span className="font-medium">{bond.coupon_rate_annual}%</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Qtd:</span>
                <span className="font-medium">{bond.quantity} unid.</span>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Valor Nominal: </span>
              <span className="font-medium">
                {formatCurrency(Number(bond.face_value_per_unit), investment.currency)}/unid.
              </span>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Pagamento: </span>
              <span className="font-medium">{getFrequencyLabel(bond.coupon_frequency)}</span>
            </div>

            {bond.isin && (
              <div className="text-sm">
                <span className="text-muted-foreground">ISIN: </span>
                <span className="font-mono">{bond.isin}</span>
              </div>
            )}

            {annualCoupon && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Rendimento Anual</span>
                  <span className="text-income">{formatCurrency(annualCoupon, investment.currency)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Por período ({getFrequencyLabel(bond.coupon_frequency).toLowerCase()})</span>
                  <span>
                    {formatCurrency(
                      annualCoupon / (bond.coupon_frequency === 'monthly' ? 12 : 
                                      bond.coupon_frequency === 'quarterly' ? 4 :
                                      bond.coupon_frequency === 'semiannual' ? 2 : 1),
                      investment.currency
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Início: {formatDate(investment.start_date)}</span>
          </div>
          {investment.maturity_date && (
            <div className={`flex items-center gap-1 ${daysRemaining !== null && daysRemaining < 30 ? 'text-warning' : 'text-muted-foreground'}`}>
              <span>Venc: {formatDate(investment.maturity_date)}</span>
              {daysRemaining !== null && daysRemaining > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {daysRemaining}d
                </Badge>
              )}
            </div>
          )}
        </div>

        {investment.notes && (
          <p className="text-xs text-muted-foreground italic pt-2 border-t">
            {investment.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
