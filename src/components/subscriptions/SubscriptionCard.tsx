import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  MoreVertical,
  Pause,
  Play,
  Pencil,
  Trash2,
  Bell,
  Tv,
  Music,
  Cloud,
  Gamepad2,
  Newspaper,
  Dumbbell,
  BookOpen,
  Shield,
  Smartphone,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  Subscription,
  BillingCycle,
  useDeleteSubscription,
  useToggleSubscription,
  getDaysUntilRenewal,
} from '@/hooks/useSubscriptions';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
}

const billingCycleLabels: Record<BillingCycle, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

const iconComponents: Record<string, typeof CreditCard> = {
  tv: Tv,
  music: Music,
  cloud: Cloud,
  'gamepad-2': Gamepad2,
  newspaper: Newspaper,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  shield: Shield,
  smartphone: Smartphone,
  'credit-card': CreditCard,
};

export function SubscriptionCard({
  subscription,
  onEdit,
}: SubscriptionCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteSubscription();
  const toggleMutation = useToggleSubscription();

  const daysUntil = getDaysUntilRenewal(subscription.next_renewal_date);
  const isUpcoming = daysUntil >= 0 && daysUntil <= subscription.alert_days_before;
  const isOverdue = daysUntil < 0;

  const IconComponent = iconComponents[subscription.icon] || CreditCard;

  const handleDelete = () => {
    deleteMutation.mutate(subscription.id);
    setDeleteDialogOpen(false);
  };

  const handleToggle = () => {
    toggleMutation.mutate({
      id: subscription.id,
      is_active: !subscription.is_active,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: subscription.currency || 'AOA',
    }).format(amount);
  };

  const getRenewalText = () => {
    if (isOverdue) return `Venceu há ${Math.abs(daysUntil)} dias`;
    if (daysUntil === 0) return 'Renova hoje';
    if (daysUntil === 1) return 'Renova amanhã';
    return `Renova em ${daysUntil} dias`;
  };

  return (
    <>
      <Card className={cn(!subscription.is_active && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: subscription.color + '20' }}
              >
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: subscription.color }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium truncate">{subscription.name}</h3>
                  {!subscription.is_active && (
                    <Badge variant="secondary">Pausada</Badge>
                  )}
                  {subscription.is_active && isUpcoming && (
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                      <Bell className="h-3 w-3 mr-1" />
                      Renovação próxima
                    </Badge>
                  )}
                  {subscription.is_active && isOverdue && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Vencida
                    </Badge>
                  )}
                </div>

                {subscription.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {subscription.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span>{billingCycleLabels[subscription.billing_cycle]}</span>
                  {subscription.account && (
                    <>
                      <span>•</span>
                      <span>{subscription.account.name}</span>
                    </>
                  )}
                  {subscription.category && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: subscription.category.color || '#6366f1',
                          }}
                        />
                        {subscription.category.name}
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={cn(
                    'text-xs mt-2',
                    isOverdue
                      ? 'text-destructive'
                      : isUpcoming
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {getRenewalText()} •{' '}
                  {format(new Date(subscription.next_renewal_date), 'dd MMM yyyy', {
                    locale: pt,
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold whitespace-nowrap">
                {formatCurrency(subscription.amount)}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggle}>
                    {subscription.is_active ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Reactivar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(subscription)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar subscrição?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser revertida. A subscrição "{subscription.name}"
              será permanentemente eliminada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
