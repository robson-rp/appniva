import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useMaturityProfile, 
  MaturityLevel, 
  getLevelDisplayName,
  FEATURE_ACCESS,
  hasFeatureAccess
} from '@/hooks/useMaturityProfile';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useActiveGoals } from '@/hooks/useGoals';
import { useDebts } from '@/hooks/useDebts';
import { useInvestments } from '@/hooks/useInvestments';

// Progress steps definition
const PROGRESS_STEPS = [
  { 
    id: 'account', 
    label: 'Criar primeira conta', 
    check: (data: ProgressData) => (data.accountsCount || 0) > 0,
    route: '/accounts'
  },
  { 
    id: 'transaction', 
    label: 'Registar primeira transação', 
    check: (data: ProgressData) => (data.transactionsCount || 0) > 0,
    route: '/transactions'
  },
  { 
    id: 'budget', 
    label: 'Definir um orçamento', 
    check: (data: ProgressData) => (data.budgetsCount || 0) > 0,
    route: '/budgets'
  },
  { 
    id: 'goal', 
    label: 'Criar uma meta', 
    check: (data: ProgressData) => (data.goalsCount || 0) > 0,
    route: '/goals'
  },
  { 
    id: 'debt_or_investment', 
    label: 'Registar dívida ou investimento', 
    check: (data: ProgressData) => (data.debtsCount || 0) > 0 || (data.investmentsCount || 0) > 0,
    route: '/debts',
    requiredLevel: 'intermediate' as MaturityLevel
  },
];

interface ProgressData {
  accountsCount: number;
  transactionsCount: number;
  budgetsCount: number;
  goalsCount: number;
  debtsCount: number;
  investmentsCount: number;
}

export function FinancialProgressCard() {
  const { maturityProfile, level, updateProgress } = useMaturityProfile();
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: budgets } = useBudgets();
  const { data: goals } = useActiveGoals();
  const { data: debts } = useDebts();
  const { data: investments } = useInvestments();

  if (!maturityProfile?.onboarding_completed) return null;

  const progressData: ProgressData = {
    accountsCount: accounts?.length || 0,
    transactionsCount: transactions?.length || 0,
    budgetsCount: budgets?.length || 0,
    goalsCount: goals?.length || 0,
    debtsCount: debts?.length || 0,
    investmentsCount: investments?.length || 0,
  };

  // Filter steps based on user level
  const availableSteps = PROGRESS_STEPS.filter(step => {
    if (!step.requiredLevel) return true;
    return hasFeatureAccess(step.route, level);
  });

  const completedSteps = availableSteps.filter(step => step.check(progressData));
  const progress = (completedSteps.length / availableSteps.length) * 100;
  const nextStep = availableSteps.find(step => !step.check(progressData));

  // All steps completed
  if (progress === 100) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-income/20 to-income/5 border border-income/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-income flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-income-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Progresso completo!</p>
            <p className="text-sm text-muted-foreground">
              Nível {getLevelDisplayName(level)} • Todas as etapas concluídas
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Progresso Financeiro</h3>
          <p className="text-xs text-muted-foreground">
            Nível {getLevelDisplayName(level)} • {completedSteps.length}/{availableSteps.length} etapas
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
          <span className="text-sm font-bold text-accent">{Math.round(progress)}%</span>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      {/* Progress Steps */}
      <div className="space-y-2">
        {availableSteps.slice(0, 3).map((step) => {
          const isCompleted = step.check(progressData);
          const isLocked = step.requiredLevel && !hasFeatureAccess(step.route, level);
          
          return (
            <Link
              key={step.id}
              to={isLocked ? '#' : step.route}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                isCompleted 
                  ? "bg-income/10" 
                  : isLocked 
                    ? "opacity-50 cursor-not-allowed" 
                    : "bg-muted/50 hover:bg-muted"
              )}
              onClick={e => isLocked && e.preventDefault()}
            >
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center",
                isCompleted ? "bg-income" : isLocked ? "bg-muted" : "bg-accent/20"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-income-foreground" />
                ) : isLocked ? (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <span className="text-xs font-medium text-accent">
                    {availableSteps.indexOf(step) + 1}
                  </span>
                )}
              </div>
              <span className={cn(
                "flex-1 text-sm",
                isCompleted ? "text-income line-through" : "text-foreground"
              )}>
                {step.label}
              </span>
              {!isCompleted && !isLocked && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Next Step CTA */}
      {nextStep && (
        <Link
          to={nextStep.route}
          className="mt-3 flex items-center justify-center gap-2 p-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium transition-colors hover:bg-accent/90"
        >
          Próximo: {nextStep.label}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
