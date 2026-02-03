import { useState } from 'react';
import { Plus, Target, Trophy, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGoals, useCreateGoal, useUpdateGoal, useAddContribution, useDeleteGoal } from '@/hooks/useGoals';
import { GoalForm } from '@/components/goals/GoalForm';
import { GoalCard } from '@/components/goals/GoalCard';
import { ContributionForm } from '@/components/goals/ContributionForm';
import { formatCurrency } from '@/lib/constants';

export default function Goals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [contributingGoal, setContributingGoal] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const addContribution = useAddContribution();
  const deleteGoal = useDeleteGoal();

  const inProgressGoals = goals?.filter((g) => g.status === 'in_progress') || [];
  const completedGoals = goals?.filter((g) => g.status === 'completed') || [];
  const cancelledGoals = goals?.filter((g) => g.status === 'cancelled') || [];

  // Calculate stats
  const totalTarget = inProgressGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSaved = inProgressGoals.reduce((sum, g) => sum + Number(g.current_saved_amount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleCreate = (data: any) => {
    createGoal.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleUpdate = (data: any) => {
    if (editingGoal) {
      updateGoal.mutate({ id: editingGoal.id, ...data }, {
        onSuccess: () => setEditingGoal(null),
      });
    }
  };

  const handleContribute = (data: { amount: number; accountId?: string }) => {
    if (contributingGoal) {
      addContribution.mutate(
        { goalId: contributingGoal.id, amount: data.amount, accountId: data.accountId },
        { onSuccess: () => setContributingGoal(null) }
      );
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGoal.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe os seus objectivos de poupança
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Activas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{inProgressGoals.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {overallProgress.toFixed(0)}% progresso geral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poupado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalSaved, 'AOA')}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              de {formatCurrency(totalTarget, 'AOA')} alvo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Concluídas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold text-income">{completedGoals.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              objectivos alcançados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <Tabs defaultValue="in_progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="in_progress">
              Activas ({inProgressGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Canceladas ({cancelledGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in_progress" className="space-y-0">
            {inProgressGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {inProgressGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => setEditingGoal(goal)}
                    onDelete={() => setDeleteId(goal.id)}
                    onContribute={() => setContributingGoal(goal)}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma meta activa</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-0">
            {completedGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => setEditingGoal(goal)}
                    onDelete={() => setDeleteId(goal.id)}
                    onContribute={() => {}}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma meta concluída ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-0">
            {cancelledGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {cancelledGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => setEditingGoal(goal)}
                    onDelete={() => setDeleteId(goal.id)}
                    onContribute={() => {}}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">Nenhuma meta cancelada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
            <p className="text-muted-foreground mb-4">
              Comece a criar metas para acompanhar o seu progresso de poupança.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
          </DialogHeader>
          <GoalForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createGoal.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              initialData={editingGoal}
              onSubmit={handleUpdate}
              onCancel={() => setEditingGoal(null)}
              isLoading={updateGoal.isPending}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Contribution Dialog */}
      <Dialog open={!!contributingGoal} onOpenChange={() => setContributingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Contribuição</DialogTitle>
          </DialogHeader>
          {contributingGoal && (
            <ContributionForm
              goalName={contributingGoal.name}
              currentAmount={Number(contributingGoal.current_saved_amount)}
              targetAmount={Number(contributingGoal.target_amount)}
              currency={contributingGoal.currency}
              onSubmit={handleContribute}
              onCancel={() => setContributingGoal(null)}
              isLoading={addContribution.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser revertida. A meta e todas as contribuições associadas serão eliminadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGoal.isPending ? (
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
