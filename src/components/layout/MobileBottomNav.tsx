import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, User, Plus, MoreHorizontal, Wallet, ArrowLeftRight, PiggyBank, Target, CreditCard, TrendingUp, Repeat, RefreshCw, GraduationCap, MessageCircle, Lightbulb, Calculator, Umbrella, Shield, Scale, TrendingDown, DollarSign, Users, Send, Receipt, Building2, Tags, ShoppingBag, ScanText, Smartphone, X, Search, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionFormWrapper } from '@/components/transactions/TransactionFormWrapper';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUnreadInsightsCount } from '@/hooks/useInsights';
import { useBudgetsAtRiskCount } from '@/hooks/useBudgets';
import { useMaturityProfile, getRequiredLevel, getLevelDisplayName, MaturityLevel } from '@/hooks/useMaturityProfile';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', route: '/home' },
  { icon: BarChart3, label: 'Dashboard', route: '/dashboard' },
  { icon: null, label: 'Novo', route: null, isCenter: true },
  { icon: MoreHorizontal, label: 'Mais', route: null, isMore: true },
  { icon: User, label: 'Perfil', route: '/profile' },
];

interface MenuItem {
  path: string;
  label: string;
  icon: typeof Wallet;
  badgeKey?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
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
export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: unreadInsights = 0 } = useUnreadInsightsCount();
  const budgetsAtRisk = useBudgetsAtRiskCount();
  const { hasAccess, level } = useMaturityProfile();
  
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Badge counts map
  const badgeCounts = useMemo(() => ({
    insights: unreadInsights,
    budgets: budgetsAtRisk,
  }), [unreadInsights, budgetsAtRisk]);

  // Total notifications for "More" button badge
  const totalNotifications = unreadInsights + budgetsAtRisk;

  // Filter menu groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return MENU_GROUPS;
    
    const query = searchQuery.toLowerCase().trim();
    return MENU_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  const handleMenuItemClick = (path: string) => {
    const canAccess = hasAccess(path);
    
    if (!canAccess) {
      const requiredLevel = getRequiredLevel(path);
      toast.info(`Disponível no nível ${getLevelDisplayName(requiredLevel || 'intermediate')}`);
      return;
    }
    
    setShowMoreMenu(false);
    setSearchQuery('');
    navigate(path);
  };

  // Reset search when drawer closes
  useEffect(() => {
    if (!showMoreMenu) {
      setSearchQuery('');
    }
  }, [showMoreMenu]);

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[100] bg-card/98 backdrop-blur-lg border-t border-border shadow-lg"
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
        <DrawerContent className="h-[85vh] flex flex-col">
          <DrawerHeader className="border-b border-border pb-4 flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold">Menu</DrawerTitle>
              <DrawerClose asChild>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar funcionalidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </DrawerHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 py-4 space-y-6 pb-8">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground animate-fade-in">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum resultado encontrado</p>
                </div>
              ) : (
                filteredGroups.map((group, groupIndex) => (
                  <div 
                    key={group.label} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${groupIndex * 50}ms` }}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {group.items.map((item, itemIndex) => {
                        const isActive = location.pathname === item.path;
                        const badgeCount = 'badgeKey' in item ? badgeCounts[item.badgeKey as keyof typeof badgeCounts] : 0;
                        const canAccess = hasAccess(item.path);
                        const requiredLevel = getRequiredLevel(item.path);
                        
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleMenuItemClick(item.path)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl transition-all relative active:scale-95",
                              !canAccess 
                                ? "opacity-50 bg-muted/30"
                                : isActive 
                                  ? "bg-accent text-accent-foreground" 
                                  : "bg-muted/50 hover:bg-muted text-foreground hover:scale-105"
                            )}
                            style={{ 
                              animationDelay: `${(groupIndex * 4 + itemIndex) * 30}ms`,
                              animationFillMode: 'both'
                            }}
                          >
                            {!canAccess && (
                              <div className="absolute top-1 right-1">
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <div className="relative transition-transform duration-200">
                              <item.icon className={cn("h-6 w-6", !canAccess && "text-muted-foreground")} />
                              {badgeCount > 0 && canAccess && (
                                <Badge 
                                  variant="destructive" 
                                  className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[9px]"
                                >
                                  {badgeCount > 9 ? '9+' : badgeCount}
                                </Badge>
                              )}
                            </div>
                            <span className={cn(
                              "text-[10px] font-medium text-center leading-tight line-clamp-2",
                              !canAccess && "text-muted-foreground"
                            )}>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}