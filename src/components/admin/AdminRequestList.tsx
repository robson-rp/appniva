import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminProductRequests, useUpdateRequestStatus } from '@/hooks/useAdminProducts';
import { RequestStatus } from '@/hooks/useFinancialProducts';
import { Loader2, Search, FileCheck, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const statusConfig: Record<RequestStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', icon: Clock, variant: 'secondary' },
  approved: { label: 'Aprovado', icon: CheckCircle, variant: 'default' },
  rejected: { label: 'Rejeitado', icon: XCircle, variant: 'destructive' },
  cancelled: { label: 'Cancelado', icon: Ban, variant: 'outline' },
};

interface RequestWithUser {
  id: string;
  user_id: string;
  product_id: string;
  status: RequestStatus;
  requested_amount: number;
  requested_term_days: number | null;
  notes: string | null;
  response_notes: string | null;
  created_at: string;
  product?: {
    name: string;
    institution_name: string;
    currency: string;
    interest_rate_annual: number | null;
  };
}

export function AdminRequestList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<RequestWithUser | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>('pending');
  const [responseNotes, setResponseNotes] = useState('');

  const { data: requests, isLoading } = useAdminProductRequests();
  const updateStatus = useUpdateRequestStatus();

  const filteredRequests = requests?.filter((r) => {
    const matchesSearch =
      r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product?.institution_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) as RequestWithUser[] | undefined;

  const handleOpenReview = (request: RequestWithUser) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setResponseNotes(request.response_notes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    await updateStatus.mutateAsync({
      id: selectedRequest.id,
      status: newStatus,
      response_notes: responseNotes || undefined,
    });

    setSelectedRequest(null);
  };

  const formatCurrency = (value: number, currency: string = 'AOA') => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const pendingCount = requests?.filter((r) => r.status === 'pending').length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Solicitações de Produtos
              </CardTitle>
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests && filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Instituição</TableHead>
                    <TableHead>Montante</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acção</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const config = statusConfig[request.status];
                    const StatusIcon = config.icon;

                    return (
                      <TableRow key={request.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: pt })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.product?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{request.product?.institution_name || '-'}</TableCell>
                        <TableCell>
                          {formatCurrency(request.requested_amount, request.product?.currency)}
                        </TableCell>
                        <TableCell>
                          {request.requested_term_days ? `${request.requested_term_days} dias` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReview(request)}
                          >
                            Rever
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Nenhuma solicitação encontrada.'
                  : 'Ainda não há solicitações.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rever Solicitação</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produto:</span>
                  <span className="font-medium">{selectedRequest.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instituição:</span>
                  <span>{selectedRequest.product?.institution_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montante:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedRequest.requested_amount, selectedRequest.product?.currency)}
                  </span>
                </div>
                {selectedRequest.requested_term_days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prazo:</span>
                    <span>{selectedRequest.requested_term_days} dias</span>
                  </div>
                )}
                {selectedRequest.product?.interest_rate_annual && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa:</span>
                    <span>{selectedRequest.product.interest_rate_annual}% ao ano</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span>{format(new Date(selectedRequest.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações do Cliente:</Label>
                  <p className="text-sm mt-1">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RequestStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responseNotes">Notas de Resposta</Label>
                <Textarea
                  id="responseNotes"
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Adicione notas sobre a decisão..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
                  {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
