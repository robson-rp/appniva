import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, FileText, CheckCircle, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDocument, ExtractedTransaction } from '@/hooks/useDocuments';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface TransactionFormData {
  id: string;
  selected: boolean;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  date: string;
  category_id: string;
  account_id: string;
}

export default function OCRReview() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: document, isLoading: docLoading } = useDocument(id || '');
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  const [transactions, setTransactions] = useState<TransactionFormData[]>([]);
  const [globalAccountId, setGlobalAccountId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isBankStatement = document?.extracted_data?.document_type === 'bank_statement';
  const extractedTransactions = document?.extracted_data?.transactions || [];

  useEffect(() => {
    if (document?.extracted_data) {
      const data = document.extracted_data;

      if (isBankStatement && extractedTransactions.length > 0) {
        // Multiple transactions from bank statement
        const txns: TransactionFormData[] = extractedTransactions.map((t: ExtractedTransaction, idx: number) => ({
          id: `tx-${idx}`,
          selected: true,
          type: t.type === 'credit' ? 'income' : 'expense',
          amount: t.amount?.toString() || '',
          description: t.description || '',
          date: t.date || new Date().toISOString().split('T')[0],
          category_id: '',
          account_id: '',
        }));

        // Try to match categories
        txns.forEach((txn, idx) => {
          const suggestedCat = extractedTransactions[idx]?.suggested_category;
          if (suggestedCat && categories.length > 0) {
            const matchedCategory = categories.find(
              (c) =>
                c.type === (txn.type === 'income' ? 'income' : 'expense') &&
                (c.name.toLowerCase().includes(suggestedCat.toLowerCase()) ||
                  suggestedCat.toLowerCase().includes(c.name.toLowerCase()))
            );
            if (matchedCategory) {
              txn.category_id = matchedCategory.id;
            }
          }
        });

        setTransactions(txns);
      } else {
        // Single transaction (receipt/invoice)
        const singleTxn: TransactionFormData = {
          id: 'tx-single',
          selected: true,
          type: 'expense',
          amount: data.amount?.toString() || '',
          description: data.description || '',
          date: data.date || new Date().toISOString().split('T')[0],
          category_id: '',
          account_id: '',
        };

        // Try to match category
        if (data.suggested_category && categories.length > 0) {
          const matchedCategory = categories.find(
            (c) =>
              c.name.toLowerCase().includes(data.suggested_category!.toLowerCase()) ||
              data.suggested_category!.toLowerCase().includes(c.name.toLowerCase())
          );
          if (matchedCategory) {
            singleTxn.category_id = matchedCategory.id;
            singleTxn.type = matchedCategory.type === 'income' ? 'income' : 'expense';
          }
        }

        setTransactions([singleTxn]);
      }
    }
  }, [document, categories, isBankStatement, extractedTransactions.length]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const activeAccounts = accounts.filter((a) => a.is_active);

  const updateTransaction = (id: string, field: keyof TransactionFormData, value: any) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (field === 'type') {
          return { ...t, [field]: value, category_id: '' };
        }
        return { ...t, [field]: value };
      })
    );
  };

  const toggleSelectAll = (selected: boolean) => {
    setTransactions((prev) => prev.map((t) => ({ ...t, selected })));
  };

  const applyGlobalAccount = () => {
    if (globalAccountId) {
      setTransactions((prev) => prev.map((t) => ({ ...t, account_id: globalAccountId })));
    }
  };

  const selectedCount = transactions.filter((t) => t.selected).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTransactions = transactions.filter((t) => t.selected);

    if (selectedTransactions.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos uma transação para guardar.',
        variant: 'destructive',
      });
      return;
    }

    const missingAccount = selectedTransactions.some((t) => !t.account_id);
    if (missingAccount) {
      toast({
        title: 'Erro',
        description: 'Todas as transações selecionadas precisam de uma conta.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const inserts = selectedTransactions.map((t) => ({
        user_id: user!.id,
        type: t.type,
        amount: parseFloat(t.amount),
        description: t.description,
        date: t.date,
        category_id: t.category_id || null,
        account_id: t.account_id,
        currency: 'AOA',
      }));

      const { error } = await supabase.from('transactions').insert(inserts);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transações criadas',
        description: `${selectedTransactions.length} transação(ões) guardada(s) com sucesso.`,
      });
      navigate('/transactions');
    } catch (error: any) {
      toast({
        title: 'Erro ao guardar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || docLoading) {
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

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Documento não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/ocr/upload')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/ocr/upload')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rever Dados Extraídos</h1>
          <p className="text-muted-foreground">
            {isBankStatement
              ? `Extrato bancário com ${extractedTransactions.length} transações detectadas.`
              : 'Verifique e corrija os dados antes de guardar como transação.'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Preview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Documento Original</CardTitle>
            <CardDescription>{document.original_filename}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {document.file_type === 'image' ? (
              <img
                src={document.file_url}
                alt="Documento"
                className="w-full rounded-lg border"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 border rounded-lg bg-muted/50">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Documento PDF</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.open(document.file_url, '_blank')}
                >
                  Abrir PDF
                </Button>
              </div>
            )}

            {isBankStatement && document.extracted_data?.bank_name && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Informações do Extrato</Label>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p><strong>Banco:</strong> {document.extracted_data.bank_name}</p>
                  {document.extracted_data.account_holder && (
                    <p><strong>Titular:</strong> {document.extracted_data.account_holder}</p>
                  )}
                  {document.extracted_data.statement_period && (
                    <p>
                      <strong>Período:</strong> {document.extracted_data.statement_period.start} a{' '}
                      {document.extracted_data.statement_period.end}
                    </p>
                  )}
                </div>
              </div>
            )}

            {document.extracted_data?.raw_text && (
              <div>
                <Label className="text-sm font-medium">Texto Extraído</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm max-h-[200px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {document.extracted_data.raw_text}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {isBankStatement ? 'Transações Detectadas' : 'Criar Transação'}
                </CardTitle>
                <CardDescription>
                  {isBankStatement
                    ? `${selectedCount} de ${transactions.length} transações selecionadas`
                    : 'Reveja os dados extraídos e faça correções se necessário.'}
                </CardDescription>
              </div>
              {isBankStatement && transactions.length > 1 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCount === transactions.length}
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    id="select-all"
                  />
                  <Label htmlFor="select-all" className="text-sm cursor-pointer">
                    Selecionar tudo
                  </Label>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Global Account Selector for Bank Statements */}
              {isBankStatement && transactions.length > 1 && (
                <div className="flex gap-4 items-end p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Aplicar conta a todas as transações</Label>
                    <Select value={globalAccountId} onValueChange={setGlobalAccountId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="secondary" onClick={applyGlobalAccount}>
                    Aplicar
                  </Button>
                </div>
              )}

              {/* Transaction List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {transactions.map((txn, idx) => (
                  <div
                    key={txn.id}
                    className={`p-4 border rounded-lg space-y-4 transition-opacity ${
                      !txn.selected ? 'opacity-50 bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isBankStatement && transactions.length > 1 && (
                          <Checkbox
                            checked={txn.selected}
                            onCheckedChange={(checked) => updateTransaction(txn.id, 'selected', !!checked)}
                          />
                        )}
                        <Badge variant={txn.type === 'income' ? 'default' : 'secondary'}>
                          {txn.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                        {isBankStatement && (
                          <span className="text-sm text-muted-foreground">#{idx + 1}</span>
                        )}
                      </div>
                      <span className="font-semibold">
                        {txn.type === 'income' ? '+' : '-'}{txn.amount || '0'} Kz
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={txn.type}
                          onValueChange={(value: 'income' | 'expense') =>
                            updateTransaction(txn.id, 'type', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Despesa</SelectItem>
                            <SelectItem value="income">Receita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Valor (Kz)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={txn.amount}
                          onChange={(e) => updateTransaction(txn.id, 'amount', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={txn.date}
                          onChange={(e) => updateTransaction(txn.id, 'date', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Conta</Label>
                        <Select
                          value={txn.account_id}
                          onValueChange={(value) => updateTransaction(txn.id, 'account_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={txn.category_id}
                          onValueChange={(value) => updateTransaction(txn.id, 'category_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {(txn.type === 'expense' ? expenseCategories : incomeCategories).map(
                              (category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Descrição</Label>
                        <Input
                          value={txn.description}
                          onChange={(e) => updateTransaction(txn.id, 'description', e.target.value)}
                          placeholder="Descrição da transação"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={isSaving || selectedCount === 0}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar {selectedCount} Transação{selectedCount !== 1 ? 'ões' : ''}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}