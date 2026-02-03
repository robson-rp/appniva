import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AlertTriangle, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  account_id: string;
  description?: string | null;
  created_at?: string | null;
  account?: {
    id: string;
    name: string;
    currency?: string;
  } | null;
  [key: string]: unknown;
}

interface DuplicateDetectorProps {
  transactions: Transaction[] | undefined;
}

export function DuplicateDetector({ transactions }: DuplicateDetectorProps) {
  const { duplicateGroups, hasDuplicates, totalDuplicates } = useDuplicateDetection(transactions);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteTransaction = useDeleteTransaction();

  const formatCurrency = (value: number, currency = 'AOA') => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAllDuplicates = () => {
    const allDuplicateIds = new Set<string>();
    duplicateGroups.forEach((group) => {
      // Select all except the first one (keep original)
      group.transactions.slice(1).forEach((tx) => {
        allDuplicateIds.add(tx.id);
      });
    });
    setSelectedIds(allDuplicateIds);
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;
    let errorCount = 0;

    for (const id of idsToDelete) {
      try {
        await deleteTransaction.mutateAsync(id);
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setSelectedIds(new Set());
    setShowDeleteDialog(false);

    if (successCount > 0) {
      toast({
        title: 'Transações excluídas',
        description: `${successCount} transação(ões) duplicada(s) excluída(s) com sucesso.`,
      });
    }
    if (errorCount > 0) {
      toast({
        title: 'Erro',
        description: `Não foi possível excluir ${errorCount} transação(ões).`,
        variant: 'destructive',
      });
    }
  };

  if (!hasDuplicates) {
    return null;
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="flex items-center justify-between">
            <span>Possíveis transações duplicadas detectadas</span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </AlertTitle>
          <AlertDescription>
            Encontradas {totalDuplicates} transação(ões) com mesma data, valor e conta.
          </AlertDescription>
        </Alert>

        <CollapsibleContent className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={selectAllDuplicates}>
              <Copy className="mr-2 h-4 w-4" />
              Selecionar todas duplicadas
            </Button>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir {selectedIds.size} selecionada(s)
              </Button>
            )}
          </div>

          {duplicateGroups.map((group) => (
            <Card key={group.key} className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    {group.transactions.length} duplicadas
                  </Badge>
                  <span>{group.accountName}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {format(new Date(group.date), "dd 'de' MMMM", { locale: pt })}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold">
                    {formatCurrency(group.amount)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.transactions.map((tx, index) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 rounded-md border p-2"
                    >
                      <Checkbox
                        checked={selectedIds.has(tx.id)}
                        onCheckedChange={() => toggleSelection(tx.id)}
                        disabled={index === 0}
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          {tx.description || 'Sem descrição'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Criado em:{' '}
                          {tx.created_at
                            ? format(new Date(tx.created_at), "dd/MM/yyyy 'às' HH:mm")
                            : 'N/A'}
                        </p>
                      </div>
                      {index === 0 && (
                        <Badge variant="secondary">Original</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedIds.size} transação(ões)
              duplicada(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
