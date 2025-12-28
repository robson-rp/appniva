import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, User, Plus, MoreHorizontal, Wallet, ArrowLeftRight, PiggyBank, Target, CreditCard, TrendingUp, Repeat, RefreshCw, GraduationCap, MessageCircle, Lightbulb, Calculator, Umbrella, Shield, Scale, TrendingDown, DollarSign, Users, Send, Receipt, Building2, Tags, ShoppingBag, ScanText, Smartphone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionFormWrapper } from '@/components/transactions/TransactionFormWrapper';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUnreadInsightsCount } from '@/hooks/useInsights';
import { useBudgetsAtRiskCount } from '@/hooks/useBudgets';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', route: '/home' },
  { icon: BarChart3, label: 'Dashboard', route: '/dashboard' },
  { icon: null, label: 'Novo', route: null, isCenter: true },
  { icon: MoreHorizontal, label: 'Mais', route: null, isMore: true },
  { icon: User, label: 'Perfil', route: '/profile' },
];

const MENU_GROUPS = [
  {
    label: 'Planeamento',
    items: [
      { path: '/accounts', label: 'Contas', icon: Wallet },
      { path: '/transactions', label: 'Transacções', icon: ArrowLeftRight },
      { path: '/budgets', label: 'Orçamentos', icon: PiggyBank, badgeKey: 'budgets' },
      { path: '/goals', label: 'Metas', icon: Target },
      { path: '/debts', label: 'Dívidas', icon: CreditCard },
      { path: '/investments', label: 'Investimentos', icon: TrendingUp },
      { path: '/subscriptions', label: 'Subscrições', icon: Repeat },
      { path: '/recurring', label: 'Recorrentes', icon: RefreshCw },
      { path: '/school-fees', label: 'Propinas', icon: GraduationCap },
    ],
  },
  {
    label: 'Análise',
    items: [
      { path: '/assistant', label: 'Assistente IA', icon: MessageCircle },
      { path: '/insights', label: 'Insights', icon: Lightbulb, badgeKey: 'insights' },
      { path: '/simulator', label: 'Simulador', icon: Calculator },
      { path: '/retirement', label: 'Reforma', icon: Umbrella },
      { path: '/emergency-fund', label: 'Fundo Emergência', icon: Shield },
      { path: '/reconciliation', label: 'Reconciliação', icon: Scale },
      { path: '/inflation-alerts', label: 'Alertas Inflação', icon: TrendingDown },
    ],
  },
  {
    label: 'Comunidade',
    items: [
      { path: '/exchange-rates', label: 'Taxas de Câmbio', icon: DollarSign },
      { path: '/kixikilas', label: 'Kixikilas', icon: Users },
      { path: '/remittances', label: 'Remessas', icon: Send },
      { path: '/split-expenses', label: 'Dividir Despesas', icon: Receipt },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { path: '/cost-centers', label: 'Centros de Custo', icon: Building2 },
      { path: '/tags', label: 'Tags', icon: Tags },
      { path: '/products', label: 'Produtos', icon: ShoppingBag },
      { path: '/ocr/upload', label: 'OCR Financeiro', icon: ScanText },
      { path: '/install', label: 'Instalar App', icon: Smartphone },
    ],
  },
];

const SCROLL_THRESHOLD = 10;

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: unreadInsights = 0 } = useUnreadInsightsCount();
  const budgetsAtRisk = useBudgetsAtRiskCount();
  
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Badge counts map
  const badgeCounts = useMemo(() => ({
    insights: unreadInsights,
    budgets: budgetsAtRisk,
  }), [unreadInsights, budgetsAtRisk]);

  // Total notifications for "More" button badge
  const totalNotifications = unreadInsights + budgetsAtRisk;

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = currentScrollY - lastScrollY.current;
          
          if (Math.abs(scrollDifference) > SCROLL_THRESHOLD) {
            if (scrollDifference > 0 && currentScrollY > 100) {
              setIsVisible(false);
            } else if (scrollDifference < 0) {
              setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
          }
          
          if (currentScrollY < 50) {
            setIsVisible(true);
          }
          
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    lastScrollY.current = 0;
  }, [location.pathname]);

  const handleMenuItemClick = (path: string) => {
    setShowMoreMenu(false);
    navigate(path);
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100] bg-card/98 backdrop-blur-lg border-t border-border shadow-lg transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item, index) => {
            if (item.isCenter) {
              return (
                <button
                  key={index}
                  onClick={() => setShowQuickAction(true)}
                  className="flex items-center justify-center -mt-6"
                >
                  <div className="h-14 w-14 rounded-full bg-accent shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
                    <Plus className="h-7 w-7 text-accent-foreground" />
                  </div>
                </button>
              );
            }

            if (item.isMore) {
              return (
                <button
                  key={index}
                  onClick={() => setShowMoreMenu(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors relative',
                    showMoreMenu ? 'text-accent' : 'text-muted-foreground'
                  )}
                >
                  <div className="relative">
                    <MoreHorizontal className={cn('h-6 w-6', showMoreMenu && 'stroke-[2.5]')} />
                    {totalNotifications > 0 && (
                      <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold flex items-center justify-center text-destructive-foreground">
                        {totalNotifications > 9 ? '9+' : totalNotifications}
                      </span>
                    )}
                  </div>
                  <span className={cn('text-[10px] font-medium', showMoreMenu && 'font-semibold')}>
                    {item.label}
                  </span>
                </button>
              );
            }

            const isActive = location.pathname === item.route;
            const Icon = item.icon!;

            return (
              <Link
                key={index}
                to={item.route!}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors',
                  isActive ? 'text-accent' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5]')} />
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Action Modal */}
      <Dialog open={showQuickAction} onOpenChange={setShowQuickAction}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <TransactionFormWrapper onSuccess={() => setShowQuickAction(false)} />
        </DialogContent>
      </Dialog>

      {/* More Menu Drawer */}
      <Drawer open={showMoreMenu} onOpenChange={setShowMoreMenu}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold">Menu</DrawerTitle>
              <DrawerClose asChild>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-6">
              {MENU_GROUPS.map((group) => (
                <div key={group.label}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const badgeCount = 'badgeKey' in item ? badgeCounts[item.badgeKey as keyof typeof badgeCounts] : 0;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleMenuItemClick(item.path)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl transition-all relative",
                            isActive 
                              ? "bg-accent text-accent-foreground" 
                              : "bg-muted/50 hover:bg-muted text-foreground"
                          )}
                        >
                          <div className="relative">
                            <item.icon className="h-6 w-6" />
                            {badgeCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[9px]"
                              >
                                {badgeCount > 9 ? '9+' : badgeCount}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}