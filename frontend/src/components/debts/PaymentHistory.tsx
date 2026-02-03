import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Trash2, Calendar, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { DebtPayment, useDebtPayments, useDeletePayment } from '@/hooks/useDebts';

interface PaymentHistoryProps {
  debtId: string;
  debtName: string;
  currency: string;
}

export function PaymentHistory({ debtId, debtName, currency }: PaymentHistoryProps) {
  const { data: payments, isLoading } = useDebtPayments(debtId);
  const deletePayment = useDeletePayment();
  const [paymentToDelete, setPaymentToDelete] = useState<DebtPayment | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDelete = () => {
    if (paymentToDelete) {
      deletePayment.mutate(
        { id: paymentToDelete.id, debtId },
        { onSuccess: () => setPaymentToDelete(null) }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>Nenhum pagamento registado</p>
        <p className="text-sm">Os pagamentos aparecerão aqui após serem registados.</p>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
        <span className="text-sm font-medium">Total Pago</span>
        <span className="font-bold text-primary">{formatCurrency(totalPaid)}</span>
      </div>

      {/* Payments List */}
      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-2">
          {payments.map((payment) => (
            <div 
              key={payment.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: pt })}
                  </span>
                  {payment.notes && (
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <FileText className="h-3 w-3" />
                      {payment.notes}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setPaymentToDelete(payment)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Delete Confirmation */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar este pagamento de{' '}
              <strong>{paymentToDelete && formatCurrency(paymentToDelete.amount)}</strong>?
              O saldo da dívida será reajustado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePayment.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePayment.isPending}
            >
              {deletePayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
