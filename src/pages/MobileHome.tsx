import { useAuth } from '@/contexts/AuthContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useMonthlyStats, useCreateTransaction } from '@/hooks/useTransactions';
import { useInvestmentStats } from '@/hooks/useInvestments';
import { useActiveGoals } from '@/hooks/useGoals';
import { useDebts } from '@/hooks/useDebts';
import { useUpcomingRenewals } from '@/hooks/useSubscriptions';
import { useInsights, useUnreadInsightsCount } from '@/hooks/useInsights';
import { formatCurrency } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpDown, 
  PiggyBank, 
  TrendingUp, 
  Target, 
  Calendar, 
  RefreshCw, 
  CreditCard, 
  BarChart3, 
  Lightbulb,
  Plus,
  Camera,
  FileText,
  Bell,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionFormWrapper } from '@/components/transactions/TransactionFormWrapper';

// Feature grid items configuration
const FEATURE_ITEMS = [
  { icon: Wallet, label: 'Contas', route: '/accounts', color: 'bg-blue-500' },
  { icon: ArrowUpDown, label: 'Transações', route: '/transactions', color: 'bg-emerald-500' },
  { icon: PiggyBank, label: 'Orçamento', route: '/budgets', color: 'bg-purple-500' },
  { icon: TrendingUp, label: 'Investimentos', route: '/investments', color: 'bg-amber-500' },
  { icon: Target, label: 'Metas', route: '/goals', color: 'bg-pink-500' },
  { icon: Calendar, label: 'Calendário', route: '/school-fees', color: 'bg-indigo-500' },
  { icon: RefreshCw, label: 'Subscrições', route: '/subscriptions', color: 'bg-teal-500' },
  { icon: CreditCard, label: 'Dívidas', route: '/debts', color: 'bg-red-500' },
  { icon: BarChart3, label: 'Relatórios', route: '/dashboard', color: 'bg-cyan-500' },
  { icon: Lightbulb, label: 'Insights', route: '/insights', color: 'bg-yellow-500' },
];

// Quick action items
const QUICK_ACTIONS = [
  { icon: Plus, label: 'Nova Transação', action: 'transaction' },
  { icon: Target, label: 'Nova Meta', route: '/goals' },
  { icon: Wallet, label: 'Nova Conta', route: '/accounts' },
  { icon: FileText, label: 'Importar', route: '/reconciliation' },
  { icon: Camera, label: 'OCR', route: '/ocr/upload' },
];

export default function MobileHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: monthlyStats, isLoading: loadingStats } = useMonthlyStats();
  const { data: investmentStats, isLoading: loadingInvestments } = useInvestmentStats();
  const { data: goals } = useActiveGoals();
  const { data: debts } = useDebts();
  const { data: insights } = useInsights();
  const { data: unreadInsights } = useUnreadInsightsCount();
  const upcomingRenewals = useUpcomingRenewals(7);

  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const currency = profile?.primary_currency || 'AOA';
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0;
  const totalInvested = investmentStats?.total || 0;
  const netWorth = totalBalance + totalInvested;
  const monthlyBalance = (monthlyStats?.income || 0) - (monthlyStats?.expense || 0);

  const isLoading = loadingAccounts || loadingStats || loadingInvestments;

  // Determine financial health status
  const getHealthStatus = () => {
    if (monthlyBalance > 0) return { status: 'healthy', color: 'bg-income', icon: CheckCircle2, text: 'Saudável' };
    if (monthlyBalance > -(monthlyStats?.income || 0) * 0.1) return { status: 'attention', color: 'bg-warning', icon: AlertTriangle, text: 'Atenção' };
    return { status: 'risk', color: 'bg-expense', icon: AlertCircle, text: 'Risco' };
  };

  const healthStatus = getHealthStatus();

  // Filter features based on user data
  const visibleFeatures = FEATURE_ITEMS.filter(item => {
    if (item.route === '/investments' && (!investmentStats || investmentStats.total === 0)) {
      return true; // Still show but can be customized
    }
    if (item.route === '/debts' && (!debts || debts.length === 0)) {
      return true; // Still show but can be customized
    }
    return true;
  });

  const handleQuickAction = (action: string | undefined, route: string | undefined) => {
    if (action === 'transaction') {
      setShowTransactionForm(true);
    } else if (route) {
      navigate(route);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* BLOCO 1 - Fixed Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Olá, {profile?.name?.split(' ')[0] || 'Utilizador'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(totalBalance, currency)} disponível
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/insights"
                className="relative h-10 w-10 rounded-full bg-muted flex items-center justify-center transition-colors hover:bg-muted/80 active:scale-95"
              >
                <Bell className="h-5 w-5 text-foreground" />
                {unreadInsights && unreadInsights > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground">
                    {unreadInsights > 9 ? '9+' : unreadInsights}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center transition-transform active:scale-95"
              >
                <User className="h-5 w-5 text-primary-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* BLOCO 2 - Financial Status Card */}
        <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Património Líquido</p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(netWorth, currency)}
              </p>
            </div>
            <div className={cn(
              'px-3 py-1.5 rounded-full flex items-center gap-1.5',
              healthStatus.status === 'healthy' && 'bg-income/10',
              healthStatus.status === 'attention' && 'bg-warning/10',
              healthStatus.status === 'risk' && 'bg-expense/10'
            )}>
              <healthStatus.icon className={cn(
                'h-4 w-4',
                healthStatus.status === 'healthy' && 'text-income',
                healthStatus.status === 'attention' && 'text-warning',
                healthStatus.status === 'risk' && 'text-expense'
              )} />
              <span className={cn(
                'text-xs font-medium',
                healthStatus.status === 'healthy' && 'text-income',
                healthStatus.status === 'attention' && 'text-warning',
                healthStatus.status === 'risk' && 'text-expense'
              )}>
                {healthStatus.text}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Balanço do Mês</p>
              <p className={cn(
                'text-lg font-semibold',
                monthlyBalance >= 0 ? 'text-income' : 'text-expense'
              )}>
                {monthlyBalance >= 0 ? '+' : ''}{formatCurrency(monthlyBalance, currency)}
              </p>
            </div>
            <Link to="/dashboard" className="text-accent text-sm font-medium flex items-center gap-1">
              Ver detalhes
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* BLOCO 3 - Feature Grid */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Funcionalidades
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {visibleFeatures.slice(0, 8).map((item) => (
              <Link
                key={item.route}
                to={item.route}
                className="flex flex-col items-center p-3 rounded-2xl bg-card border border-border transition-all hover:shadow-md active:scale-95"
              >
                <div className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center mb-2',
                  item.color
                )}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          
          {visibleFeatures.length > 8 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {visibleFeatures.slice(8).map((item) => (
                <Link
                  key={item.route}
                  to={item.route}
                  className="flex flex-col items-center p-3 rounded-2xl bg-card border border-border transition-all hover:shadow-md active:scale-95"
                >
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center mb-2',
                    item.color
                  )}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* BLOCO 4 - Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Acções Rápidas
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action, action.route)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
              >
                <action.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* BLOCO 5 - Summary Mini Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Resumo Rápido
          </h2>

          {/* Upcoming Payments */}
          {upcomingRenewals && upcomingRenewals.length > 0 && (
            <Link
              to="/subscriptions"
              className="block p-4 rounded-xl bg-card border border-border transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">Próximos Pagamentos</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {upcomingRenewals.length} subscrição(ões) a renovar em 7 dias
              </p>
            </Link>
          )}

          {/* Goals Progress */}
          {goals && goals.length > 0 && (
            <Link
              to="/goals"
              className="block p-4 rounded-xl bg-card border border-border transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-semibold text-foreground">Metas Ativas</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {goals.length} meta(s) em progresso
              </p>
            </Link>
          )}

          {/* Active Debts */}
          {debts && debts.filter(d => d.status === 'active').length > 0 && (
            <Link
              to="/debts"
              className="block p-4 rounded-xl bg-card border border-border transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-foreground">Dívidas Ativas</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {debts.filter(d => d.status === 'active').length} dívida(s) ativa(s)
              </p>
            </Link>
          )}

          {/* Latest Insight */}
          {insights && insights.length > 0 && (
            <Link
              to="/insights"
              className="block p-4 rounded-xl bg-accent/10 border border-accent/20 transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">Insight do Dia</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {insights[0].title}
              </p>
            </Link>
          )}
        </div>
      </main>

      {/* Transaction Form Modal */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <TransactionFormWrapper onSuccess={() => setShowTransactionForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}