import { useState } from 'react';
import { Sparkles, CheckCheck, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  useInsights, 
  useUnreadInsightsCount, 
  useMarkInsightAsRead, 
  useMarkAllInsightsAsRead, 
  useGenerateInsights,
  useDeleteInsight 
} from '@/hooks/useInsights';
import { InsightCard } from '@/components/insights/InsightCard';

export default function Insights() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: insights, isLoading } = useInsights();
  const { data: unreadCount } = useUnreadInsightsCount();
  const markAsRead = useMarkInsightAsRead();
  const markAllAsRead = useMarkAllInsightsAsRead();
  const generateInsights = useGenerateInsights();
  const deleteInsight = useDeleteInsight();

  const unreadInsights = insights?.filter((i) => !i.is_read) || [];
  const readInsights = insights?.filter((i) => i.is_read) || [];

  const handleDelete = () => {
    if (deleteId) {
      deleteInsight.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground">
            Análises e sugestões personalizadas com IA
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount && unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar Todos
            </Button>
          )}
          <Button 
            onClick={() => generateInsights.mutate()}
            disabled={generateInsights.isPending}
          >
            {generateInsights.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                A gerar...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Insights
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Info Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent-teal/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Insights com Inteligência Artificial</h3>
              <p className="text-sm text-muted-foreground mt-1">
                A IA analisa as tuas transacções, orçamentos, metas e investimentos para gerar 
                sugestões personalizadas de poupança e alertas sobre a tua saúde financeira.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights && insights.length > 0 ? (
        <Tabs defaultValue="unread" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unread">
              Não Lidos ({unreadInsights.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todos ({insights.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Lidos ({readInsights.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="space-y-4">
            {unreadInsights.length > 0 ? (
              unreadInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkAsRead={() => markAsRead.mutate(insight.id)}
                  onDelete={() => setDeleteId(insight.id)}
                />
              ))
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <CheckCheck className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Todos os insights foram lidos</p>
                  <Button 
                    variant="link" 
                    onClick={() => generateInsights.mutate()}
                    disabled={generateInsights.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Gerar novos insights
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={() => markAsRead.mutate(insight.id)}
                onDelete={() => setDeleteId(insight.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            {readInsights.length > 0 ? (
              readInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkAsRead={() => {}}
                  onDelete={() => setDeleteId(insight.id)}
                />
              ))
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum insight lido ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum insight ainda</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Clica em "Gerar Insights" para a IA analisar os teus dados financeiros 
              e criar sugestões personalizadas.
            </p>
            <Button 
              onClick={() => generateInsights.mutate()}
              disabled={generateInsights.isPending}
            >
              {generateInsights.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A gerar...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar insight?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInsight.isPending ? (
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
