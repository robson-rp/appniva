import { useState, useCallback } from 'react';
import { Upload, FileText, Image, Loader2, Trash2, Zap, Check } from 'lucide-react';
import { useDocuments, UploadedDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ImportedTransaction } from '@/hooks/useReconciliation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OCRUploaderProps {
  onImport: (transactions: ImportedTransaction[]) => void;
  isImporting: boolean;
}

export function OCRUploader({ onImport, isImporting }: OCRUploaderProps) {
  const { documents, isLoading, uploadDocument, processDocument, deleteDocument } = useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (isValidFile(file)) {
          uploadDocument.mutate(file);
        }
      });
    },
    [uploadDocument]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (isValidFile(file)) {
        uploadDocument.mutate(file);
      }
    });
    e.target.value = '';
  };

  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
  };

  const handleProcess = async (doc: UploadedDocument) => {
    setProcessingId(doc.id);
    try {
      await processDocument.mutateAsync(doc.id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSelectDocument = (doc: UploadedDocument) => {
    setSelectedDoc(doc);
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
      .map((tx: any) => ({
        external_amount: Math.abs(tx.amount),
        external_description: tx.description,
        external_date: tx.date,
      }));

    onImport(transactions);
    setSelectedDoc(null);
    setSelectedTransactions(new Set());
  };

  // Filter processed bank statements
  const bankStatements = documents.filter(
    (doc) =>
      doc.processed &&
      doc.extracted_data?.document_type === 'bank_statement' &&
      doc.extracted_data?.transactions?.length > 0
  );

  // Filter pending/unprocessed documents
  const pendingDocs = documents.filter((doc) => !doc.processed);

  // If viewing transaction selection
  if (selectedDoc) {
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
            {transactions.map((tx: any, index: number) => (
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
            disabled={selectedTransactions.size === 0 || isImporting}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            {isImporting
              ? 'Importando...'
              : `Importar ${selectedTransactions.size} Transações`}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5" />
          Processar Extrato OCR
        </CardTitle>
        <CardDescription>
          Carregue extratos bancários ou recibos para extração automática de transações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            {uploadDocument.isPending ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploadDocument.isPending
                ? 'A carregar...'
                : 'Arraste ficheiros ou clique para selecionar'}
            </p>
            <p className="text-xs text-muted-foreground">
              Suporta JPEG, PNG, WebP e PDF até 10MB
            </p>
          </div>
        </div>

        {/* Pending Documents */}
        {pendingDocs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Pendentes de Processamento
            </h4>
            <div className="space-y-2">
              {pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {doc.file_type === 'pdf' ? (
                      <FileText className="h-4 w-4 text-destructive" />
                    ) : (
                      <Image className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm truncate max-w-[150px]">
                      {doc.original_filename || 'Documento'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleProcess(doc)}
                      disabled={processingId === doc.id}
                    >
                      {processingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      <span className="ml-1.5">
                        {processingId === doc.id ? 'A processar...' : 'Processar'}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument.mutate(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processed Bank Statements */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : bankStatements.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Extratos Processados
            </h4>
            <div className="space-y-2">
              {bankStatements.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectDocument(doc)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">
                        {doc.original_filename || 'Documento'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(doc.created_at), "dd MMM yyyy", { locale: ptBR })}
                        {doc.extracted_data?.bank_name && ` • ${doc.extracted_data.bank_name}`}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {doc.extracted_data?.transactions?.length || 0} transações
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : pendingDocs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Nenhum extrato processado. Carregue um documento acima.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
