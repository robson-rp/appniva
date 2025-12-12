import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductRequests, useCancelProductRequest, RequestStatus } from '@/hooks/useFinancialProducts';
import { Loader2, Clock, CheckCircle, XCircle, Ban, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const statusConfig: Record<RequestStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', icon: Clock, variant: 'secondary' },
  approved: { label: 'Aprovado', icon: CheckCircle, variant: 'default' },
  rejected: { label: 'Rejeitado', icon: XCircle, variant: 'destructive' },
  cancelled: { label: 'Cancelado', icon: Ban, variant: 'outline' },
};

export function MyRequests() {
  const { data: requests, isLoading } = useProductRequests();
  const cancelRequest = useCancelProductRequest();

  const formatCurrency = (value: number, currency: string = 'AOA') => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhuma solicitação</p>
          <p className="text-sm text-muted-foreground">
            Explore os produtos financeiros disponíveis e faça a sua primeira solicitação.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const config = statusConfig[request.status];
        const StatusIcon = config.icon;

        return (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {request.product?.name || 'Produto'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {request.product?.institution_name}
                  </p>
                </div>
                <Badge variant={config.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Montante</span>
                  <p className="font-semibold">
                    {formatCurrency(request.requested_amount, request.product?.currency)}
                  </p>
                </div>
                {request.requested_term_days && (
                  <div>
                    <span className="text-muted-foreground">Prazo</span>
                    <p className="font-semibold">{request.requested_term_days} dias</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Data</span>
                  <p className="font-semibold">
                    {format(new Date(request.created_at), 'dd MMM yyyy', { locale: pt })}
                  </p>
                </div>
                {request.product?.interest_rate_annual && (
                  <div>
                    <span className="text-muted-foreground">Taxa</span>
                    <p className="font-semibold text-primary">
                      {request.product.interest_rate_annual}%
                    </p>
                  </div>
                )}
              </div>

              {request.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Observações: </span>
                  {request.notes}
                </div>
              )}

              {request.response_notes && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="font-medium">Resposta: </span>
                  {request.response_notes}
                </div>
              )}

              {request.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelRequest.mutate(request.id)}
                  disabled={cancelRequest.isPending}
                >
                  {cancelRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancelar Solicitação
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
