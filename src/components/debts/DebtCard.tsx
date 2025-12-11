import { format, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  CreditCard, 
  Home, 
  Car, 
  User, 
  GraduationCap, 
  MoreHorizontal,
  Calendar,
  Percent,
  Building2,
  AlertTriangle,
  CheckCircle2,
  History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Debt, DebtType } from '@/hooks/useDebts';
import { cn } from '@/lib/utils';

const debtTypeConfig: Record<DebtType, { label: string; icon: typeof CreditCard; color: string }> = {
  personal: { label: 'Pessoal', icon: User, color: 'bg-blue-500' },
  mortgage: { label: 'Hipoteca', icon: Home, color: 'bg-emerald-500' },
  car: { label: 'Automóvel', icon: Car, color: 'bg-orange-500' },
  credit_card: { label: 'Cartão de Crédito', icon: CreditCard, color: 'bg-red-500' },
  student: { label: 'Estudantil', icon: GraduationCap, color: 'bg-purple-500' },
  other: { label: 'Outro', icon: MoreHorizontal, color: 'bg-muted' },
};

const frequencyLabels: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onPayment: (debt: Debt) => void;
  onViewHistory: (debt: Debt) => void;
}

export function DebtCard({ debt, onEdit, onDelete, onPayment, onViewHistory }: DebtCardProps) {
  const config = debtTypeConfig[debt.type];
  const Icon = config.icon;
  
  const paidPercentage = ((debt.principal_amount - debt.current_balance) / debt.principal_amount) * 100;
  const isOverdue = debt.next_payment_date && new Date(debt.next_payment_date) < new Date();
  const daysUntilPayment = debt.next_payment_date 
    ? differenceInDays(new Date(debt.next_payment_date), new Date())
    : null;
  
  // Calculate remaining time based on installment frequency
  const getFrequencyMonths = (freq: string): number => {
    switch (freq) {
      case 'monthly': return 1;
      case 'quarterly': return 3;
      case 'semiannual': return 6;
      case 'annual': return 12;
      default: return 1;
    }
  };
  
  const remainingInstallments = debt.installment_amount > 0 
    ? Math.ceil(debt.current_balance / debt.installment_amount)
    : 0;
  const remainingMonths = remainingInstallments * getFrequencyMonths(debt.installment_frequency);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: debt.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      debt.status === 'closed' && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.color)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{debt.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
                {debt.status === 'closed' ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Pago
                  </Badge>
                ) : isOverdue ? (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Em atraso
                  </Badge>
                ) : daysUntilPayment !== null && daysUntilPayment <= 7 ? (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    {daysUntilPayment} dias
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {debt.status === 'active' && (
                <DropdownMenuItem onClick={() => onPayment(debt)}>
                  Registar Pagamento
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onViewHistory(debt)}>
                <History className="h-4 w-4 mr-2" />
                Ver Histórico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(debt)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(debt)}
                className="text-destructive focus:text-destructive"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Balance Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saldo Actual</span>
            <span className="font-semibold">{formatCurrency(debt.current_balance)}</span>
          </div>
          <Progress value={paidPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pago: {paidPercentage.toFixed(0)}%</span>
            <span>Total: {formatCurrency(debt.principal_amount)}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Prestação: {formatCurrency(debt.installment_amount)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            <span>Taxa: {debt.interest_rate_annual}%/ano</span>
          </div>
          {debt.institution && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Building2 className="h-4 w-4" />
              <span>{debt.institution}</span>
            </div>
          )}
        </div>

        {/* Next Payment & Remaining Time */}
        {debt.status === 'active' && (
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="text-sm">
              <span className="text-muted-foreground">Próx. Pagamento: </span>
              {debt.next_payment_date ? (
                <span className={cn(isOverdue && "text-destructive font-medium")}>
                  {format(new Date(debt.next_payment_date), "dd MMM yyyy", { locale: pt })}
                </span>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              ~{remainingMonths} meses restantes
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
