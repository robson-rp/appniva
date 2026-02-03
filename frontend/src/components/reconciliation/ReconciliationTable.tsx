import { BankReconciliation } from '@/hooks/useReconciliation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, CheckCircle, AlertTriangle, Clock, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReconciliationTableProps {
  reconciliations: BankReconciliation[];
  onDelete: (id: string) => void;
  onLinkTransaction: (reconciliation: BankReconciliation) => void;
  isDeleting: boolean;
}

const statusConfig = {
  matched: {
    label: 'Conciliado',
    icon: CheckCircle,
    variant: 'default' as const,
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  mismatched: {
    label: 'Inconsistente',
    icon: AlertTriangle,
    variant: 'destructive' as const,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
};

export function ReconciliationTable({
  reconciliations,
  onDelete,
  onLinkTransaction,
  isDeleting,
}: ReconciliationTableProps) {
  if (reconciliations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum dado importado para reconciliação.</p>
        <p className="text-sm">Importe um extrato CSV ou use dados do OCR.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Data Externa</TableHead>
            <TableHead>Descrição Externa</TableHead>
            <TableHead className="text-right">Valor Externo</TableHead>
            <TableHead>Transação Vinculada</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reconciliations.map((rec) => {
            const config = statusConfig[rec.status];
            const StatusIcon = config.icon;

            return (
              <TableRow key={rec.id}>
                <TableCell>
                  <Badge variant={config.variant} className={config.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {rec.external_date
                    ? format(new Date(rec.external_date), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {rec.external_description || '-'}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {rec.external_amount.toLocaleString('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                  })}
                </TableCell>
                <TableCell>
                  {rec.transaction ? (
                    <div className="text-sm">
                      <div className="font-medium">
                        {rec.transaction.amount.toLocaleString('pt-AO', {
                          style: 'currency',
                          currency: 'AOA',
                        })}
                      </div>
                      <div className="text-muted-foreground truncate max-w-[150px]">
                        {rec.transaction.description || 'Sem descrição'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Não vinculada</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {rec.status !== 'matched' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onLinkTransaction(rec)}
                        title="Vincular transação"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(rec.id)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
