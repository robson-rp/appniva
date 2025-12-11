import { useState } from 'react';
import { FileDown, Calendar, Filter, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BankReconciliation } from '@/hooks/useReconciliation';
import { format, subMonths, isAfter, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReconciliationReportProps {
  reconciliations: BankReconciliation[];
  accountName: string;
  internalBalance: number;
}

type FilterPeriod = 'all' | '1month' | '3months' | '6months' | '12months';
type FilterStatus = 'all' | 'matched' | 'mismatched' | 'pending';

export function ReconciliationReport({
  reconciliations,
  accountName,
  internalBalance,
}: ReconciliationReportProps) {
  const [period, setPeriod] = useState<FilterPeriod>('all');
  const [status, setStatus] = useState<FilterStatus>('all');

  const getFilteredReconciliations = () => {
    let filtered = [...reconciliations];

    // Filter by period
    if (period !== 'all') {
      const months = parseInt(period.replace('month', '').replace('s', ''));
      const cutoffDate = startOfMonth(subMonths(new Date(), months));
      filtered = filtered.filter((r) => isAfter(new Date(r.created_at), cutoffDate));
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }

    // Sort by date descending
    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const filteredReconciliations = getFilteredReconciliations();

  const stats = {
    total: filteredReconciliations.length,
    matched: filteredReconciliations.filter((r) => r.status === 'matched').length,
    mismatched: filteredReconciliations.filter((r) => r.status === 'mismatched').length,
    pending: filteredReconciliations.filter((r) => r.status === 'pending').length,
    totalExternal: filteredReconciliations.reduce((sum, r) => sum + r.external_amount, 0),
  };

  const getStatusBadge = (recStatus: string) => {
    switch (recStatus) {
      case 'matched':
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Conciliado
          </Badge>
        );
      case 'mismatched':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Divergente
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Relatório de Reconciliação Bancária', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Conta: ${accountName}`, 14, 32);
    doc.text(`Data do Relatório: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 14, 40);

    // Summary
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text('Resumo', 14, 55);

    doc.setFontSize(10);
    doc.text(`Total de Registros: ${stats.total}`, 14, 65);
    doc.text(`Conciliados: ${stats.matched}`, 14, 72);
    doc.text(`Divergentes: ${stats.mismatched}`, 14, 79);
    doc.text(`Pendentes: ${stats.pending}`, 14, 86);
    doc.text(
      `Saldo Interno: ${internalBalance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`,
      14,
      93
    );
    doc.text(
      `Total Externo: ${stats.totalExternal.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`,
      14,
      100
    );

    // Table
    const tableData = filteredReconciliations.map((rec) => [
      format(new Date(rec.created_at), 'dd/MM/yyyy'),
      rec.external_date ? format(new Date(rec.external_date), 'dd/MM/yyyy') : '-',
      rec.external_description || '-',
      rec.external_amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }),
      rec.status === 'matched' ? 'Conciliado' : rec.status === 'mismatched' ? 'Divergente' : 'Pendente',
      rec.transaction?.description || '-',
    ]);

    autoTable(doc, {
      head: [['Data Reg.', 'Data Ext.', 'Descrição Externa', 'Valor', 'Estado', 'Transação Vinculada']],
      body: tableData,
      startY: 110,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { cellWidth: 40 },
        5: { cellWidth: 35 },
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`reconciliacao-${accountName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório de Reconciliação
            </CardTitle>
            <CardDescription>
              Histórico completo de reconciliações com filtros e exportação
            </CardDescription>
          </div>
          <Button onClick={exportToPDF} disabled={filteredReconciliations.length === 0}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={period} onValueChange={(v) => setPeriod(v as FilterPeriod)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="12months">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={(v) => setStatus(v as FilterStatus)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="matched">Conciliados</SelectItem>
                <SelectItem value="mismatched">Divergentes</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="rounded-lg border p-3 text-center border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <div className="text-2xl font-bold text-green-600">{stats.matched}</div>
            <div className="text-sm text-muted-foreground">Conciliados</div>
          </div>
          <div className="rounded-lg border p-3 text-center border-destructive/20 bg-destructive/5">
            <div className="text-2xl font-bold text-destructive">{stats.mismatched}</div>
            <div className="text-sm text-muted-foreground">Divergentes</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </div>
        </div>

        {/* History Table */}
        {filteredReconciliations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum registro encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Data Registro</th>
                    <th className="p-3 text-left text-sm font-medium">Data Externa</th>
                    <th className="p-3 text-left text-sm font-medium">Descrição</th>
                    <th className="p-3 text-right text-sm font-medium">Valor</th>
                    <th className="p-3 text-left text-sm font-medium">Estado</th>
                    <th className="p-3 text-left text-sm font-medium">Transação Vinculada</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredReconciliations.slice(0, 100).map((rec) => (
                    <tr key={rec.id} className="hover:bg-muted/30">
                      <td className="p-3 text-sm">
                        {format(new Date(rec.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-3 text-sm">
                        {rec.external_date
                          ? format(new Date(rec.external_date), 'dd/MM/yyyy')
                          : '-'}
                      </td>
                      <td className="p-3 text-sm max-w-[200px] truncate">
                        {rec.external_description || '-'}
                      </td>
                      <td className="p-3 text-sm text-right font-mono">
                        {rec.external_amount.toLocaleString('pt-AO', {
                          style: 'currency',
                          currency: 'AOA',
                        })}
                      </td>
                      <td className="p-3">{getStatusBadge(rec.status)}</td>
                      <td className="p-3 text-sm max-w-[150px] truncate text-muted-foreground">
                        {rec.transaction?.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredReconciliations.length > 100 && (
              <div className="p-3 text-center text-sm text-muted-foreground bg-muted/30">
                Mostrando 100 de {filteredReconciliations.length} registros. Exporte o PDF para ver todos.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
