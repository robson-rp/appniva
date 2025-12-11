import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Check, Calendar, ArrowRight } from 'lucide-react';
import { useDocuments, UploadedDocument, ExtractedTransaction } from '@/hooks/useDocuments';
import { ImportedTransaction } from '@/hooks/useReconciliation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OCRImporterProps {
  onImport: (transactions: ImportedTransaction[]) => void;
  isLoading: boolean;
}

export function OCRImporter({ onImport, isLoading }: OCRImporterProps) {
  const { documents, isLoading: loadingDocs } = useDocuments();
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());

  // Filter only processed bank statements with transactions
  const bankStatements = documents.filter(
    (doc) =>
      doc.processed &&
      doc.extracted_data?.document_type === 'bank_statement' &&
      doc.extracted_data?.transactions &&
      doc.extracted_data.transactions.length > 0
  );

  const handleSelectDocument = (doc: UploadedDocument) => {
    setSelectedDoc(doc);
    // Select all transactions by default
    const txCount = doc.extracted_data?.transactions?.length || 0;
    setSelectedTransactions(new Set(Array.from({ length: txCount }, (_, i) => i)));
  };

  const handleToggleTransaction = (index: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    const txCount = selectedDoc?.extracted_data?.transactions?.length || 0;
    if (selectedTransactions.size === txCount) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(Array.from({ length: txCount }, (_, i) => i)));
    }
  };

  const handleImport = () => {
    if (!selectedDoc?.extracted_data?.transactions) return;

    const transactions: ImportedTransaction[] = selectedDoc.extracted_data.transactions
      .filter((_, index) => selectedTransactions.has(index))
      .map((tx: ExtractedTransaction) => ({
        external_amount: Math.abs(tx.amount),
        external_description: tx.description,
        external_date: tx.date,
      }));

    onImport(transactions);
    setSelectedDoc(null);
    setSelectedTransactions(new Set());
  };

  if (loadingDocs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Importar do OCR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  // Show document selection if no document is selected
  if (!selectedDoc) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Importar do OCR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankStatements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum extrato bancário processado disponível.</p>
              <p className="text-sm mt-2">
                Carregue e processe um extrato bancário na página de OCR primeiro.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selecione um extrato processado para importar transações:
              </p>
              {bankStatements.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectDocument(doc)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">
                        {doc.original_filename || 'Documento sem nome'}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(doc.created_at), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                        {doc.extracted_data?.bank_name && (
                          <>
                            <span>•</span>
                            <span>{doc.extracted_data.bank_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {doc.extracted_data?.transactions?.length || 0} transações
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show transaction selection
  const transactions = selectedDoc.extracted_data?.transactions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Selecionar Transações
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)}>
            Voltar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium">{selectedDoc.original_filename}</div>
          {selectedDoc.extracted_data?.bank_name && (
            <div className="text-sm text-muted-foreground">
              {selectedDoc.extracted_data.bank_name}
            </div>
          )}
          {selectedDoc.extracted_data?.statement_period && (
            <div className="text-sm text-muted-foreground">
              Período: {selectedDoc.extracted_data.statement_period.start} -{' '}
              {selectedDoc.extracted_data.statement_period.end}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedTransactions.size === transactions.length
              ? 'Desselecionar Todas'
              : 'Selecionar Todas'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedTransactions.size} de {transactions.length} selecionadas
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto rounded-lg border divide-y">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
              onClick={() => handleToggleTransaction(index)}
            >
              <Checkbox
                checked={selectedTransactions.has(index)}
                onCheckedChange={() => handleToggleTransaction(index)}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{tx.description}</div>
                <div className="text-sm text-muted-foreground">{tx.date}</div>
              </div>
              <div
                className={`font-mono font-medium ${
                  tx.type === 'credit' ? 'text-green-600' : 'text-destructive'
                }`}
              >
                {tx.type === 'credit' ? '+' : '-'}
                {Math.abs(tx.amount).toLocaleString('pt-AO', {
                  style: 'currency',
                  currency: 'AOA',
                })}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleImport}
          disabled={selectedTransactions.size === 0 || isLoading}
          className="w-full"
        >
          <Check className="h-4 w-4 mr-2" />
          {isLoading
            ? 'Importando...'
            : `Importar ${selectedTransactions.size} Transações`}
        </Button>
      </CardContent>
    </Card>
  );
}
