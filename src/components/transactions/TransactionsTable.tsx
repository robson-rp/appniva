import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatCurrency, formatDate, TRANSACTION_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  description: string | null;
  currency: string;
  account: { id: string; name: string; currency: string } | null;
  category: { id: string; name: string; icon: string | null; color: string | null; type: string } | null;
  related_account: { id: string; name: string } | null;
  cost_center: { id: string; name: string; type: 'income_center' | 'expense_center' } | null;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const typeIcons = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: ArrowLeftRight,
};

const typeColors = {
  income: 'text-income bg-income/10',
  expense: 'text-expense bg-expense/10',
  transfer: 'text-transfer bg-transfer/10',
};

export function TransactionsTable({ transactions, onDelete, isDeleting }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <p className="text-muted-foreground">Nenhuma transacção encontrada</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Centro de Custo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Montante</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const TypeIcon = typeIcons[transaction.type];
            const typeInfo = TRANSACTION_TYPES.find(t => t.value === transaction.type);
            
            return (
              <TableRow key={transaction.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-sm">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>
                  <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', typeColors[transaction.type])}>
                    <TypeIcon className="h-3 w-3" />
                    {typeInfo?.label}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {transaction.account?.name || 'N/A'}
                    {transaction.type === 'transfer' && transaction.related_account && (
                      <span className="text-muted-foreground">
                        {' → '}{transaction.related_account.name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.category ? (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: transaction.category.color || undefined }}
                    >
                      {transaction.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {transaction.cost_center ? (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs gap-1",
                        transaction.cost_center.type === 'income_center' 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      )}
                    >
                      <Building2 className="h-3 w-3" />
                      {transaction.cost_center.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {transaction.description || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    'font-semibold',
                    transaction.type === 'income' && 'text-income',
                    transaction.type === 'expense' && 'text-expense',
                    transaction.type === 'transfer' && 'text-transfer'
                  )}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(Number(transaction.amount), transaction.currency)}
                  </span>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar transacção?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acção não pode ser desfeita. O saldo da conta será ajustado automaticamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(transaction.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
