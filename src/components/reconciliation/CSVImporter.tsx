import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { ImportedTransaction } from '@/hooks/useReconciliation';
import { toast } from 'sonner';

interface CSVImporterProps {
  onImport: (transactions: ImportedTransaction[]) => void;
  isLoading: boolean;
}

export function CSVImporter({ onImport, isLoading }: CSVImporterProps) {
  const [preview, setPreview] = useState<ImportedTransaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ImportedTransaction[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const transactions: ImportedTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[,;]/).map((v) => v.trim().replace(/"/g, ''));

      if (values.length >= 3) {
        const dateStr = values[0];
        const description = values[1];
        const amountStr = values[2].replace(/[^\d.,-]/g, '').replace(',', '.');
        const amount = parseFloat(amountStr);

        if (!isNaN(amount) && dateStr) {
          // Try to parse date (support DD/MM/YYYY and YYYY-MM-DD)
          let parsedDate = dateStr;
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          transactions.push({
            external_date: parsedDate,
            external_description: description || 'Sem descrição',
            external_amount: Math.abs(amount),
          });
        }
      }
    }

    return transactions;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        toast.error('Não foi possível extrair transações do arquivo. Verifique o formato.');
        return;
      }

      setPreview(parsed);
      toast.success(`${parsed.length} transações encontradas no arquivo`);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5" />
          Importar Extrato CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Formato esperado: Data, Descrição, Valor (separado por vírgula ou ponto-e-vírgula)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo CSV
          </Button>
        </div>

        {preview.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">
              Preview ({preview.length} transações):
            </div>
            <div className="max-h-48 overflow-y-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Descrição</th>
                    <th className="p-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((t, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{t.external_date}</td>
                      <td className="p-2 truncate max-w-[200px]">{t.external_description}</td>
                      <td className="p-2 text-right">
                        {t.external_amount.toLocaleString('pt-AO', {
                          style: 'currency',
                          currency: 'AOA',
                        })}
                      </td>
                    </tr>
                  ))}
                  {preview.length > 10 && (
                    <tr className="border-t">
                      <td colSpan={3} className="p-2 text-center text-muted-foreground">
                        ... e mais {preview.length - 10} transações
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Button onClick={handleImport} disabled={isLoading} className="w-full">
              {isLoading ? 'Importando...' : `Importar ${preview.length} Transações`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
