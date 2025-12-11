import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCostCentersWithStats,
  useCreateCostCenter,
  useUpdateCostCenter,
  useDeleteCostCenter,
  CostCenterWithStats,
} from '@/hooks/useCostCenters';
import { CostCenterCard } from '@/components/cost-centers/CostCenterCard';
import { CostCenterForm } from '@/components/cost-centers/CostCenterForm';
import { CostCenterCharts } from '@/components/cost-centers/CostCenterCharts';
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

const CostCenters = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<CostCenterWithStats | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: centers, isLoading } = useCostCentersWithStats();
  const createMutation = useCreateCostCenter();
  const updateMutation = useUpdateCostCenter();
  const deleteMutation = useDeleteCostCenter();

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const handleUpdate = (data: any) => {
    if (editingCenter) {
      updateMutation.mutate(
        { id: editingCenter.id, ...data },
        { onSuccess: () => setEditingCenter(null) }
      );
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  };

  const expenseCenters = centers?.filter((c) => c.type === 'expense_center') || [];
  const incomeCenters = centers?.filter((c) => c.type === 'income_center') || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Centros de Custo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus centros de receita e despesa
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Centro
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="expense">Centros de Despesa</TabsTrigger>
          <TabsTrigger value="income">Centros de Receita</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          ) : centers && centers.length > 0 ? (
            <CostCenterCharts centers={centers} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum centro de custo cadastrado</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro centro
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : expenseCenters.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expenseCenters.map((center) => (
                <CostCenterCard
                  key={center.id}
                  center={center}
                  onEdit={setEditingCenter}
                  onDelete={setDeletingId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum centro de despesa cadastrado</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : incomeCenters.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incomeCenters.map((center) => (
                <CostCenterCard
                  key={center.id}
                  center={center}
                  onEdit={setEditingCenter}
                  onDelete={setDeletingId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum centro de receita cadastrado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Centro de Custo</DialogTitle>
          </DialogHeader>
          <CostCenterForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCenter} onOpenChange={() => setEditingCenter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Centro de Custo</DialogTitle>
          </DialogHeader>
          {editingCenter && (
            <CostCenterForm
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              defaultValues={editingCenter}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este centro de custo? As transações
              associadas não serão excluídas, apenas desvinculadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CostCenters;
