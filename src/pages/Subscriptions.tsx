import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, CreditCard, TrendingUp, Bell, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard';
import {
  useSubscriptions,
  useSubscriptionStats,
  useUpcomingRenewals,
  Subscription,
} from '@/hooks/useSubscriptions';

export default function SubscriptionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const { data: subscriptions, isLoading } = useSubscriptions();
  const stats = useSubscriptionStats();
  const upcomingRenewals = useUpcomingRenewals(7);

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingSubscription(null);
    }
  };

  const activeSubscriptions = subscriptions?.filter((s) => s.is_active) || [];
  const pausedSubscriptions = subscriptions?.filter((s) => !s.is_active) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Subscrições | Bolso Inteligente</title>
        <meta
          name="description"
          content="Gerencie suas subscrições e serviços recorrentes"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Subscrições
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus serviços e assinaturas
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Subscrição
          </Button>
        </div>

        {/* Upcoming Renewals Alert */}
        {upcomingRenewals.length > 0 && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertTitle>Renovações Próximas</AlertTitle>
            <AlertDescription>
              Tem {upcomingRenewals.length} subscrição(ões) a renovar nos próximos
              7 dias:{' '}
              {upcomingRenewals.map((s) => s.name).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscrições Activas
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActive}</div>
              <p className="text-xs text-muted-foreground">
                serviços subscritos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthlyTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                estimativa mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Anual</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(stats.yearlyTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                projecção anual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Activas ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Pausadas ({pausedSubscriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">Nenhuma subscrição</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-1">
                    Adicione suas subscrições para rastrear custos mensais e
                    receber alertas de renovação.
                  </p>
                  <Button className="mt-4" onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeira
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            {pausedSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">Nenhuma subscrição pausada</h3>
                  <p className="text-muted-foreground">
                    Subscrições pausadas aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pausedSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <SubscriptionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        editingSubscription={editingSubscription}
      />
    </>
  );
}
