import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Calendar, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionFormWrapper } from '@/components/transactions/TransactionFormWrapper';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', route: '/home' },
  { icon: BarChart3, label: 'Dashboard', route: '/dashboard' },
  { icon: null, label: 'Novo', route: null, isCenter: true }, // Center FAB
  { icon: Calendar, label: 'Agenda', route: '/school-fees' },
  { icon: User, label: 'Perfil', route: '/profile' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [showQuickAction, setShowQuickAction] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-pb">
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
    </>
  );
}