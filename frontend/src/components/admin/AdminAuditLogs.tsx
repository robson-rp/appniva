import { useAuditLogs } from '@/hooks/useAuditLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Eye, CheckCircle, XCircle, Plus, Edit, Trash2, Users, Package, FileText, UserX, UserCheck, BarChart3 } from 'lucide-react';

const actionIcons: Record<string, React.ReactNode> = {
  view_user_data: <Eye className="h-4 w-4" />,
  view_users: <Users className="h-4 w-4" />,
  view_requests: <FileText className="h-4 w-4" />,
  view_products: <Package className="h-4 w-4" />,
  view_metrics: <BarChart3 className="h-4 w-4" />,
  approve_request: <CheckCircle className="h-4 w-4 text-green-500" />,
  reject_request: <XCircle className="h-4 w-4 text-red-500" />,
  create_product: <Plus className="h-4 w-4 text-blue-500" />,
  update_product: <Edit className="h-4 w-4 text-yellow-500" />,
  delete_product: <Trash2 className="h-4 w-4 text-red-500" />,
  suspend_user: <UserX className="h-4 w-4 text-red-500" />,
  activate_user: <UserCheck className="h-4 w-4 text-green-500" />,
};

const actionLabels: Record<string, string> = {
  view_user_data: 'Visualizou dados do utilizador',
  view_users: 'Visualizou lista de utilizadores',
  view_requests: 'Visualizou solicitações',
  view_products: 'Visualizou produtos',
  view_metrics: 'Visualizou métricas',
  approve_request: 'Aprovou solicitação',
  reject_request: 'Rejeitou solicitação',
  create_product: 'Criou produto',
  update_product: 'Actualizou produto',
  delete_product: 'Eliminou produto',
  suspend_user: 'Suspendeu utilizador',
  activate_user: 'Activou utilizador',
};

const actionVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  view_user_data: 'outline',
  view_users: 'outline',
  view_requests: 'outline',
  view_products: 'outline',
  view_metrics: 'outline',
  approve_request: 'default',
  reject_request: 'destructive',
  create_product: 'secondary',
  update_product: 'secondary',
  delete_product: 'destructive',
  suspend_user: 'destructive',
  activate_user: 'default',
};

export function AdminAuditLogs() {
  const { data: logs, isLoading } = useAuditLogs(100);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Logs de Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">
                    {actionIcons[log.action_type] || <Eye className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={actionVariants[log.action_type] || 'outline'}>
                        {actionLabels[log.action_type] || log.action_type}
                      </Badge>
                      {log.target_table && (
                        <span className="text-xs text-muted-foreground">
                          Tabela: {log.target_table}
                        </span>
                      )}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.created_at), "dd MMM yyyy 'às' HH:mm", { locale: pt })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum log de auditoria encontrado
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
