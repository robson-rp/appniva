import { useState } from 'react';
import { Plus, TrendingUp, Landmark, PiggyBank, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvestments, useInvestmentStats, useCreateInvestment, useDeleteInvestment } from '@/hooks/useInvestments';
import { InvestmentForm } from '@/components/investments/InvestmentForm';
import { InvestmentCard } from '@/components/investments/InvestmentCard';
import { formatCurrency } from '@/lib/constants';

export default function Investments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: investments, isLoading } = useInvestments();
  const { data: stats } = useInvestmentStats();
  const createInvestment = useCreateInvestment();
  const deleteInvestment = useDeleteInvestment();

  const termDeposits = investments?.filter((i) => i.investment_type === 'term_deposit') || [];
  const bonds = investments?.filter((i) => i.investment_type === 'bond_otnr') || [];

  const handleCreate = (data: {
    investment: any;
    termDeposit?: any;
    bondOTNR?: any;
  }) => {
    createInvestment.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteInvestment.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
          <p className="text-muted-foreground">
            Gerir depósitos a prazo e títulos do tesouro
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Investimento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.total || 0, 'AOA')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depósitos a Prazo</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.byType?.term_deposit || 0, 'AOA')}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {termDeposits.length} {termDeposits.length === 1 ? 'depósito' : 'depósitos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Títulos OTNR</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.byType?.bond_otnr || 0, 'AOA')}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {bonds.length} {bonds.length === 1 ? 'título' : 'títulos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : investments && investments.length > 0 ? (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              Todos ({investments.length})
            </TabsTrigger>
            <TabsTrigger value="term_deposit">
              Depósitos ({termDeposits.length})
            </TabsTrigger>
            <TabsTrigger value="bond_otnr">
              OTNR ({bonds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-0">
            <div className="grid gap-4 md:grid-cols-2">
              {investments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onDelete={() => setDeleteId(investment.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="term_deposit" className="space-y-0">
            <div className="grid gap-4 md:grid-cols-2">
              {termDeposits.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onDelete={() => setDeleteId(investment.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bond_otnr" className="space-y-0">
            <div className="grid gap-4 md:grid-cols-2">
              {bonds.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onDelete={() => setDeleteId(investment.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum investimento</h3>
            <p className="text-muted-foreground mb-4">
              Comece a registar os seus investimentos para acompanhar o rendimento.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Investimento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Investimento</DialogTitle>
          </DialogHeader>
          <InvestmentForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createInvestment.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar investimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser revertida. O investimento será permanentemente eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInvestment.isPending ? (
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
