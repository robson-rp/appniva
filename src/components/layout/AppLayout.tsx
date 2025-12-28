import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadInsightsCount } from '@/hooks/useInsights';
import { useBudgetsAtRiskCount } from '@/hooks/useBudgets';
import { useMenuPreferences } from '@/hooks/useMenuPreferences';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Target,
  TrendingUp,
  Lightbulb,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ScanText,
  CreditCard,
  Calculator,
  Scale,
  Building2,
  Tags,
  MessageCircle,
  ShoppingBag,
  RefreshCw,
  Repeat,
  Umbrella,
  Shield,
  Smartphone,
  Briefcase,
  BarChart3,
  Wrench,
  DollarSign,
  Users,
  Send,
  GraduationCap,
  Receipt,
  TrendingDown,
  Bell,
  Search,
  Globe,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MenuCustomizer } from './MenuCustomizer';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

// All available items for pinning (only Dashboard stays at top level)
const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

// Collapsible groups
const navGroups = [
  {
    label: 'Planeamento',
    icon: Briefcase,
    items: [
      { path: '/accounts', label: 'Contas', icon: Wallet },
      { path: '/transactions', label: 'Transacções', icon: ArrowLeftRight },
      { path: '/budgets', label: 'Orçamentos', icon: PiggyBank },
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
    icon: BarChart3,
    items: [
      { path: '/assistant', label: 'Assistente IA', icon: MessageCircle },
      { path: '/insights', label: 'Insights', icon: Lightbulb, hasBadge: true },
      { path: '/simulator', label: 'Simulador', icon: Calculator },
      { path: '/retirement', label: 'Reforma', icon: Umbrella },
      { path: '/emergency-fund', label: 'Fundo Emergência', icon: Shield },
      { path: '/reconciliation', label: 'Reconciliação', icon: Scale },
      { path: '/inflation-alerts', label: 'Alertas Inflação', icon: TrendingDown },
    ],
  },
  {
    label: 'Comunidade',
    icon: DollarSign,
    items: [
      { path: '/exchange-rates', label: 'Taxas de Câmbio', icon: DollarSign },
      { path: '/kixikilas', label: 'Kixikilas', icon: Users },
      { path: '/remittances', label: 'Remessas', icon: Send },
      { path: '/split-expenses', label: 'Dividir Despesas', icon: Receipt },
    ],
  },
  {
    label: 'Ferramentas',
    icon: Wrench,
    items: [
      { path: '/cost-centers', label: 'Centros de Custo', icon: Building2 },
      { path: '/tags', label: 'Tags', icon: Tags },
      { path: '/products', label: 'Produtos', icon: ShoppingBag },
      { path: '/ocr/upload', label: 'OCR Financeiro', icon: ScanText },
      { path: '/install', label: 'Instalar App', icon: Smartphone },
    ],
  },
];

const adminNavItems = [
  { path: '/admin', label: 'Painel Admin', icon: Settings },
];

export default function AppLayout() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { data: unreadCount = 0 } = useUnreadInsightsCount();
  const budgetsAtRisk = useBudgetsAtRiskCount();
  const { pinnedItems, togglePin, isPinned, resetToDefault } = useMenuPreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    // Auto-open group that contains current path
    const currentGroup = navGroups.find(g => g.items.some(i => i.path === location.pathname));
    return currentGroup ? [currentGroup.label] : [];
  });

  const languages = [
    { code: 'pt', label: 'Português', flag: '🇦🇴' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = i18n.language?.split('-')[0] || 'pt';

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // All searchable items
  const searchableItems = [
    ...allNavItems,
    ...navGroups.flatMap(g => g.items),
  ];

  const handleSearchSelect = (path: string) => {
    setSearchOpen(false);
    navigate(path);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  // Get all items from groups for customizer
  const allGroupItems = navGroups.flatMap(g => g.items);
  const allItems = [...allNavItems, ...allGroupItems];

  // Get pinned items with their full data
  const pinnedNavItems = allItems.filter(item => pinnedItems.includes(item.path));

  // Calculate alerts per group
  const groupAlerts: Record<string, number> = {
    'Planeamento': budgetsAtRisk,
    'Análise': unreadCount,
    'Ferramentas': 0,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Skip onboarding for admins
  if (!isAdmin && profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect admins to admin panel by default
  if (isAdmin && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Wallet className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">Bolso Inteligente</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {/* Header with customizer */}
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Menu Principal
            </span>
            <MenuCustomizer
              allItems={allNavItems}
              navGroups={navGroups}
              pinnedItems={pinnedItems}
              onTogglePin={togglePin}
              onReset={resetToDefault}
            />
          </div>

          {/* Pinned items always visible */}
          {pinnedNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const hasBadge = 'hasBadge' in item && item.hasBadge && unreadCount > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn('sidebar-link relative', isActive && 'sidebar-link-active')}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {hasBadge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}

          <div className="py-2">
            <Separator className="bg-sidebar-border" />
          </div>

          {/* Collapsible groups */}
          {navGroups.map((group) => {
            const isOpen = openGroups.includes(group.label);
            const hasActiveItem = group.items.some(i => location.pathname === i.path);
            const alertCount = groupAlerts[group.label] || 0;
            
            return (
              <Collapsible
                key={group.label}
                open={isOpen}
                onOpenChange={() => toggleGroup(group.label)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'sidebar-link w-full justify-between',
                      hasActiveItem && 'text-sidebar-primary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className="h-5 w-5" />
                      <span>{group.label}</span>
                      {alertCount > 0 && !isOpen && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {alertCount > 9 ? '9+' : alertCount}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isOpen && 'rotate-90'
                    )} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const showBadge = item.hasBadge && unreadCount > 0;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'sidebar-link relative text-sm py-2',
                          isActive && 'sidebar-link-active'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {showBadge && (
                          <Badge 
                            variant="destructive" 
                            className="absolute right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          
          {isAdmin && (
            <>
              <div className="py-2">
                <Separator className="bg-sidebar-border" />
                <p className="mt-3 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  Administração
                </p>
              </div>
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn('sidebar-link relative', isActive && 'sidebar-link-active')}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{profile?.name || 'Utilizador'}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground h-9 px-3"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Pesquisar...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex-1 lg:flex-none" />

          {/* Right side icons */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/insights')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('language.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(currentLanguage === lang.code && 'bg-accent')}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                    {currentLanguage === lang.code && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Alterar tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tema</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Command Dialog for Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Pesquisar funcionalidades..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            {searchableItems.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => handleSearchSelect(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
