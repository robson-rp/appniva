import { useState, useMemo } from 'react';
import { Plus, CreditCard, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { DebtCard } from '@/components/debts/DebtCard';
import { DebtForm } from '@/components/debts/DebtForm';
import { PaymentForm } from '@/components/debts/PaymentForm';
import { DebtEvolutionChart } from '@/components/debts/DebtEvolutionChart';
import { AmortizationSimulator } from '@/components/debts/AmortizationSimulator';
import { 
  useDebts, 
  useCreateDebt, 
  useUpdateDebt, 
  useDeleteDebt, 
  useCreatePayment,
  useAllDebtPayments,
  Debt,
  CreateDebtInput,
} from '@/hooks/useDebts';

export default function Debts() {
  const { data: debts, isLoading } = useDebts();
  const { data: allPayments, isLoading: isLoadingPayments } = useAllDebtPayments();
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const deleteDebt = useDeleteDebt();
  const createPayment = useCreatePayment();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!debts) return { totalBalance: 0, totalInstallment: 0, activeCount: 0, overdueCount: 0 };
    
    const activeDebts = debts.filter(d => d.status === 'active');
    const today = new Date();
    
    return {
      totalBalance: activeDebts.reduce((sum, d) => sum + d.current_balance, 0),
      totalInstallment: activeDebts.reduce((sum, d) => sum + d.installment_amount, 0),
      activeCount: activeDebts.length,
      overdueCount: activeDebts.filter(d => 
        d.next_payment_date && new Date(d.next_payment_date) < today
      ).length,
    };
  }, [debts]);

  // Filter debts by status
  const activeDebts = debts?.filter(d => d.status === 'active') || [];
  const closedDebts = debts?.filter(d => d.status === 'closed') || [];

  // Sort by next payment date (overdue first)
  const sortedActiveDebts = [...activeDebts].sort((a, b) => {
    if (!a.next_payment_date) return 1;
    if (!b.next_payment_date) return -1;
    return new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime();
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleOpenCreate = () => {
    setSelectedDebt(null);
    setIsFormOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsFormOpen(true);
  };

  const handleDelete = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDeleteOpen(true);
  };

  const handlePayment = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentOpen(true);
  };

  const handleFormSubmit = (data: CreateDebtInput) => {
    if (selectedDebt) {
      updateDebt.mutate(
        { id: selectedDebt.id, ...data },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createDebt.mutate(data, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handlePaymentSubmit = (data: { amount: number; payment_date: string; notes?: string }) => {
    if (selectedDebt) {
      createPayment.mutate(
        { debt_id: selectedDebt.id, ...data },
        { onSuccess: () => setIsPaymentOpen(false) }
      );
    }
  };

  const handleConfirmDelete = () => {
    if (selectedDebt) {
      deleteDebt.mutate(selectedDebt.id, { onSuccess: () => setIsDeleteOpen(false) });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dívidas e Créditos</h1>
          <p className="text-muted-foreground">Gerencie suas dívidas e acompanhe pagamentos</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Dívida
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dívida Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">{stats.activeCount} dívidas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prestações Mensais</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInstallment)}</div>
            <p className="text-xs text-muted-foreground">Total mensal estimado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sortedActiveDebts[0]?.next_payment_date ? (
              <>
                <div className="text-2xl font-bold">
                  {differenceInDays(new Date(sortedActiveDebts[0].next_payment_date), new Date())} dias
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {sortedActiveDebts[0].name}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">N/A</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">Pagamentos atrasados</p>
          </CardContent>
        </Card>
      </div>

      {/* Debt Evolution Chart */}
      {debts && debts.length > 0 && (
        <DebtEvolutionChart debts={debts} payments={allPayments || []} />
      )}

      {/* Amortization Simulator */}
      {debts && debts.length > 0 && (
        <AmortizationSimulator debts={debts} />
      )}

      {/* Debts List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Activas ({activeDebts.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Pagas ({closedDebts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {sortedActiveDebts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Sem dívidas activas</h3>
                <p className="text-muted-foreground text-center max-w-md mt-1">
                  Você não tem dívidas registadas. Adicione uma para começar a acompanhar seus pagamentos.
                </p>
                <Button className="mt-4" onClick={handleOpenCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Dívida
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedActiveDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPayment={handlePayment}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedDebts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhuma dívida paga ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closedDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPayment={handlePayment}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDebt ? 'Editar Dívida' : 'Nova Dívida'}
            </DialogTitle>
          </DialogHeader>
          <DebtForm
            debt={selectedDebt}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createDebt.isPending || updateDebt.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registar Pagamento</DialogTitle>
          </DialogHeader>
          {selectedDebt && (
            <PaymentForm
              debt={selectedDebt}
              onSubmit={handlePaymentSubmit}
              onCancel={() => setIsPaymentOpen(false)}
              isLoading={createPayment.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Dívida</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar "{selectedDebt?.name}"? 
              Esta acção não pode ser revertida e todos os pagamentos associados serão eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
