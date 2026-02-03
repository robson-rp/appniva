import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image, Loader2, Trash2, Eye, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments, UploadedDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function OCRUpload() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { documents, isLoading, uploadDocument, processDocument, deleteDocument } = useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      navigate(`/ocr/review/${doc.id}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">OCR Financeiro</h1>
        <p className="text-muted-foreground">
          Envie recibos, facturas ou extratos bancários para conversão automática em transações.
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carregar Documentos
          </CardTitle>
          <CardDescription>
            Arraste ficheiros ou clique para selecionar. Suporta imagens (JPEG, PNG, WebP) e PDFs até 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploadDocument.isPending
                  ? 'A carregar...'
                  : 'Arraste ficheiros aqui ou clique para selecionar'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Carregados</CardTitle>
          <CardDescription>
            Lista de documentos para processamento OCR
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum documento carregado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ficheiro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {doc.file_type === 'pdf' ? (
                          <FileText className="h-4 w-4 text-destructive" />
                        ) : (
                          <Image className="h-4 w-4 text-primary" />
                        )}
                        <span className="truncate max-w-[200px]">
                          {doc.original_filename || 'Documento'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {doc.file_type === 'pdf' ? 'PDF' : 'Imagem'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.processed ? (
                        <Badge variant="default" className="bg-green-600">
                          Processado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.created_at), "dd MMM yyyy, HH:mm", { locale: pt })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.processed ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/ocr/review/${doc.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleProcess(doc)}
                            disabled={processingId === doc.id}
                          >
                            {processingId === doc.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-1" />
                            )}
                            Processar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument.mutate(doc.id)}
                          disabled={deleteDocument.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
