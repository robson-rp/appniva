import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Calendar,
  MoreVertical,
  Pause,
  Play,
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  RefreshCw,
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
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  RecurringTransaction,
  RecurringFrequency,
  TransactionType,
  useDeleteRecurringTransaction,
  useToggleRecurringTransaction,
} from '@/hooks/useRecurringTransactions';

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
}

const frequencyLabels: Record<RecurringFrequency, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

const typeConfig: Record<
  TransactionType,
  { label: string; icon: typeof ArrowDownCircle; color: string }
> = {
  income: {
    label: 'Receita',
    icon: ArrowDownCircle,
    color: 'text-emerald-500',
  },
  expense: {
    label: 'Despesa',
    icon: ArrowUpCircle,
    color: 'text-rose-500',
  },
  transfer: {
    label: 'Transferência',
    icon: ArrowLeftRight,
    color: 'text-blue-500',
  },
};

export function RecurringTransactionCard({
  transaction,
  onEdit,
}: RecurringTransactionCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteRecurringTransaction();
  const toggleMutation = useToggleRecurringTransaction();

  const config = typeConfig[transaction.type];
  const TypeIcon = config.icon;

  const handleDelete = () => {
    deleteMutation.mutate(transaction.id);
    setDeleteDialogOpen(false);
  };

  const handleToggle = () => {
    toggleMutation.mutate({
      id: transaction.id,
      is_active: !transaction.is_active,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: transaction.account?.currency || 'AOA',
    }).format(amount);
  };

  return (
    <>
      <Card className={cn(!transaction.is_active && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted',
                  config.color
                )}
              >
                <TypeIcon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium truncate">{transaction.description}</h3>
                  <Badge variant={transaction.is_active ? 'default' : 'secondary'}>
                    {transaction.is_active ? 'Activo' : 'Pausado'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    {frequencyLabels[transaction.frequency]}
                  </span>
                  <span>•</span>
                  <span>{transaction.account?.name}</span>
                  {transaction.category && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: transaction.category.color || '#6366f1',
                          }}
                        />
                        {transaction.category.name}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Próxima:{' '}
                    {format(new Date(transaction.next_execution_date), 'dd MMM yyyy', {
                      locale: pt,
                    })}
                  </span>
                  {transaction.end_date && (
                    <span className="text-muted-foreground/60">
                      (até{' '}
                      {format(new Date(transaction.end_date), 'dd MMM yyyy', {
                        locale: pt,
                      })}
                      )
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn('font-semibold whitespace-nowrap', config.color)}>
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggle}>
                    {transaction.is_active ? (
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
                  <DropdownMenuItem onClick={() => onEdit(transaction)}>
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
            <AlertDialogTitle>Eliminar transação recorrente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser revertida. As transações já criadas não serão
              afectadas.
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
