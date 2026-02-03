import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BankReconciliation } from '@/hooks/useReconciliation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Check, X } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  type: string;
}

interface TransactionLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reconciliation: BankReconciliation | null;
  transactions: Transaction[];
  onLink: (reconciliationId: string, transactionId: string, status: 'matched' | 'mismatched') => void;
  onMarkMismatched: (reconciliationId: string) => void;
  isLoading: boolean;
}

export function TransactionLinkDialog({
  open,
  onOpenChange,
  reconciliation,
  transactions,
  onLink,
  onMarkMismatched,
  isLoading,
}: TransactionLinkDialogProps) {
  const [search, setSearch] = useState('');

  if (!reconciliation) return null;

  const filteredTransactions = transactions.filter((t) => {
    const searchLower = search.toLowerCase();
    return (
      t.description?.toLowerCase().includes(searchLower) ||
      t.amount.toString().includes(search) ||
      t.date.includes(search)
    );
  });

  const getMatchScore = (tx: Transaction): 'exact' | 'amount' | 'none' => {
    const amountMatch = Math.abs(tx.amount - reconciliation.external_amount) < 0.01;
    const dateMatch = tx.date === reconciliation.external_date;

    if (amountMatch && dateMatch) return 'exact';
    if (amountMatch) return 'amount';
    return 'none';
  };

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const scoreA = getMatchScore(a);
    const scoreB = getMatchScore(b);
    const order = { exact: 0, amount: 1, none: 2 };
    return order[scoreA] - order[scoreB];
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Vincular Transação</DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Dados do Extrato:</div>
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Data: </span>
              <span className="font-medium">
                {reconciliation.external_date
                  ? format(new Date(reconciliation.external_date), 'dd/MM/yyyy', { locale: ptBR })
                  : '-'}
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Valor: </span>
              <span className="font-medium font-mono">
                {reconciliation.external_amount.toLocaleString('pt-AO', {
                  style: 'currency',
                  currency: 'AOA',
                })}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">Descrição: </span>
              <span className="font-medium">{reconciliation.external_description || '-'}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          ) : (
            sortedTransactions.map((tx) => {
              const matchScore = getMatchScore(tx);
              const difference = tx.amount - reconciliation.external_amount;

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {tx.description || 'Sem descrição'}
                      </span>
                      {matchScore === 'exact' && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Correspondência exata
                        </Badge>
                      )}
                      {matchScore === 'amount' && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          Mesmo valor
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>{format(new Date(tx.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span className="font-mono">
                        {tx.amount.toLocaleString('pt-AO', {
                          style: 'currency',
                          currency: 'AOA',
                        })}
                      </span>
                      {difference !== 0 && (
                        <span className={difference > 0 ? 'text-green-600' : 'text-destructive'}>
                          (Dif: {difference > 0 ? '+' : ''}
                          {difference.toLocaleString('pt-AO', {
                            style: 'currency',
                            currency: 'AOA',
                          })}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      onLink(
                        reconciliation.id,
                        tx.id,
                        matchScore === 'exact' ? 'matched' : 'mismatched'
                      )
                    }
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Vincular
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onMarkMismatched(reconciliation.id)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Marcar como Inconsistente
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
